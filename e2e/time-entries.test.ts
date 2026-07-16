import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/time-entries/list.ts";
import { show } from "../result/time-entries/show.ts";
import { create } from "../result/time-entries/create.ts";
import { update } from "../result/time-entries/update.ts";
import { deleteTimeEntry } from "../result/time-entries/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";
import { listIssues } from "../result/issues/list.ts";

Deno.test({
  name: "E2E: Time Entries API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    const issuesResult = await listIssues(e2eContext, {
      projectId: project.id,
    });
    assert(issuesResult.isOk());
    assert(issuesResult.value.length > 0);
    const issue = issuesResult.value[0];

    // Activities are a server-wide enumeration seeded by Redmine's default
    // data, which this test suite does not control, so an empty list is
    // treated as "skip" rather than a failure.
    const activitiesResponse = await fetch(
      `${e2eContext.endpoint}/enumerations/time_entry_activities.json`,
      { headers: { "X-Redmine-API-Key": e2eContext.apiKey } },
    );
    assert(activitiesResponse.ok);
    const activitiesData = await activitiesResponse.json() as {
      time_entry_activities: { id: number; name: string }[];
    };
    if (activitiesData.time_entry_activities.length === 0) {
      console.warn(
        "No time entry activities are configured on the server; skipping E2E: Time Entries API",
      );
      return;
    }
    const activityId = activitiesData.time_entry_activities[0].id;

    await t.step(
      "POST /time_entries.json should create a time entry",
      async () => {
        const result = await create(e2eContext, {
          issueId: issue.id,
          hours: 2.5,
          activityId,
          comments: "E2E Created Time Entry",
          spentOn: new Date("2026-07-01"),
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /time_entries.json?project_id=... should return time entries",
      async () => {
        const result = await fetchList(e2eContext, { projectId: project.id });
        assert(result.isOk());
        assert(result.value.length > 0);
        const created = result.value.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        assert(created !== undefined);
      },
    );

    await t.step(
      "GET /time_entries/:id.json should return a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project.id,
        });
        assert(listResult.isOk());
        const timeEntry = listResult.value.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        assert(timeEntry !== undefined);

        const result = await show(e2eContext, timeEntry.id);
        assert(result.isOk());
        assertEquals(result.value.id, timeEntry.id);
        assertEquals(result.value.hours, 2.5);
        assert(result.value.project !== undefined);
        assert(result.value.issue !== undefined);
        assertEquals(result.value.issue?.id, issue.id);
      },
    );

    await t.step(
      "PUT /time_entries/:id.json should update a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project.id,
        });
        assert(listResult.isOk());
        const timeEntry = listResult.value.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        assert(timeEntry !== undefined);

        const result = await update(e2eContext, timeEntry.id, {
          hours: 4,
          comments: "E2E Updated Time Entry",
        });
        assert(result.isOk());

        const showResult = await show(e2eContext, timeEntry.id);
        assert(showResult.isOk());
        assertEquals(showResult.value.hours, 4);
        assertEquals(showResult.value.comments, "E2E Updated Time Entry");
      },
    );

    await t.step(
      "DELETE /time_entries/:id.json should delete a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project.id,
        });
        assert(listResult.isOk());
        const timeEntry = listResult.value.find((e) =>
          e.comments === "E2E Updated Time Entry"
        );
        assert(timeEntry !== undefined);

        const result = await deleteTimeEntry(e2eContext, timeEntry.id);
        assert(result.isOk());

        const showResult = await show(e2eContext, timeEntry.id);
        assert(showResult.isErr());
      },
    );
  },
});
