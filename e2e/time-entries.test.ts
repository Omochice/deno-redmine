import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../time-entries/list.ts";
import { show } from "../time-entries/show.ts";
import { create } from "../time-entries/create.ts";
import { update } from "../time-entries/update.ts";
import { deleteTimeEntry } from "../time-entries/delete.ts";
import { fetchList as fetchProjects } from "../projects/list.ts";
import { listIssues } from "../issues/list.ts";

Deno.test({
  name: "E2E: Time Entries API",
  fn: async (t) => {
    const projects = await fetchProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    const issues = await listIssues(e2eContext, {
      projectId: project!.id,
    });
    expect(issues.length).toBeGreaterThan(0);
    const issue = issues[0];

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
        await create(e2eContext, {
          issueId: issue.id,
          hours: 2.5,
          activityId,
          comments: "E2E Created Time Entry",
          spentOn: new Date("2026-07-01"),
        });
      },
    );

    await t.step(
      "GET /time_entries.json?project_id=... should return time entries",
      async () => {
        const timeEntries = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        expect(timeEntries.length).toBeGreaterThan(0);
        const created = timeEntries.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(created).toBeDefined();
      },
    );

    await t.step(
      "GET /time_entries/:id.json should return a time entry",
      async () => {
        const timeEntries = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        const timeEntry = timeEntries.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(timeEntry).toBeDefined();

        const shown = await show(e2eContext, timeEntry!.id);
        expect(shown.id).toStrictEqual(timeEntry!.id);
        expect(shown.hours).toStrictEqual(2.5);
        expect(shown.project).toBeDefined();
        expect(shown.issue).toBeDefined();
        expect(shown.issue?.id).toStrictEqual(issue.id);
      },
    );

    await t.step(
      "PUT /time_entries/:id.json should update a time entry",
      async () => {
        const timeEntries = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        const timeEntry = timeEntries.find((e) =>
          e.comments === "E2E Created Time Entry"
        );
        expect(timeEntry).toBeDefined();

        await update(e2eContext, timeEntry!.id, {
          hours: 4,
          comments: "E2E Updated Time Entry",
        });

        const shown = await show(e2eContext, timeEntry!.id);
        expect(shown.hours).toStrictEqual(4);
        expect(shown.comments).toStrictEqual(
          "E2E Updated Time Entry",
        );
      },
    );

    await t.step(
      "DELETE /time_entries/:id.json should delete a time entry",
      async () => {
        const timeEntries = await fetchList(e2eContext, {
          projectId: project!.id,
        });
        const timeEntry = timeEntries.find((e) =>
          e.comments === "E2E Updated Time Entry"
        );
        expect(timeEntry).toBeDefined();

        await deleteTimeEntry(e2eContext, timeEntry!.id);

        await expect(show(e2eContext, timeEntry!.id)).rejects.toThrow();
      },
    );
  },
});
