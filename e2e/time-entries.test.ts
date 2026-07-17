import { expect } from "jsr:@std/expect@1.0.20";
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
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project !== undefined).toBe(true);

    const issuesResult = await listIssues(e2eContext, {
      projectId: project!.id,
    });
    expect(issuesResult.isOk()).toBe(true);
    expect(issuesResult._unsafeUnwrap().length > 0).toBe(true);
    const issue = issuesResult._unsafeUnwrap()[0];

    // Activities are a server-wide enumeration seeded by Redmine's default
    // data, which this test suite does not control, so an empty list is
    // treated as "skip" rather than a failure.
    const activitiesResponse = await fetch(
      `${e2eContext.endpoint}/enumerations/time_entry_activities.json`,
      { headers: { "X-Redmine-API-Key": e2eContext.apiKey } },
    );
    expect(activitiesResponse.ok).toBe(true);
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
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /time_entries.json?project_id=... should return time entries",
      async () => {
        const result = await fetchList(e2eContext, { projectId: project!.id });
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length > 0).toBe(true);
        const created = result._unsafeUnwrap().find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(created !== undefined).toBe(true);
      },
    );

    await t.step(
      "GET /time_entries/:id.json should return a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        expect(listResult.isOk()).toBe(true);
        const timeEntry = listResult._unsafeUnwrap().find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(timeEntry !== undefined).toBe(true);

        const result = await show(e2eContext, timeEntry!.id);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().id).toEqual(timeEntry!.id);
        expect(result._unsafeUnwrap().hours).toEqual(2.5);
        expect(result._unsafeUnwrap().project !== undefined).toBe(true);
        expect(result._unsafeUnwrap().issue !== undefined).toBe(true);
        expect(result._unsafeUnwrap().issue?.id).toEqual(issue.id);
      },
    );

    await t.step(
      "PUT /time_entries/:id.json should update a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        expect(listResult.isOk()).toBe(true);
        const timeEntry = listResult._unsafeUnwrap().find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(timeEntry !== undefined).toBe(true);

        const result = await update(e2eContext, timeEntry!.id, {
          hours: 4,
          comments: "E2E Updated Time Entry",
        });
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, timeEntry!.id);
        expect(showResult.isOk()).toBe(true);
        expect(showResult._unsafeUnwrap().hours).toEqual(4);
        expect(showResult._unsafeUnwrap().comments).toEqual(
          "E2E Updated Time Entry",
        );
      },
    );

    await t.step(
      "DELETE /time_entries/:id.json should delete a time entry",
      async () => {
        const listResult = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        expect(listResult.isOk()).toBe(true);
        const timeEntry = listResult._unsafeUnwrap().find((e) =>
          e.comments === "E2E Updated Time Entry"
        );
        expect(timeEntry !== undefined).toBe(true);

        const result = await deleteTimeEntry(e2eContext, timeEntry!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, timeEntry!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
