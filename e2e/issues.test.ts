import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../issues/list.ts";
import { show } from "../issues/show.ts";
import { createIssue } from "../issues/create.ts";
import { update } from "../issues/update.ts";
import { deleteIssue } from "../issues/delete.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Issues API",
  fn: async (t) => {
    await t.step("GET /issues.json should return issues", async () => {
      const issues = await list(e2eContext, {});
      expect(issues.length).toBeGreaterThan(0);
    });

    await t.step("GET /issues/:id.json should return an issue", async () => {
      const issues = await list(e2eContext, {});
      expect(issues.length).toBeGreaterThan(0);
      const issueId = issues[0].id;

      const issue = await show(e2eContext, issueId);
      expect(issue.id).toStrictEqual(issueId);
      expect(issue.project).toBeDefined();
      expect(issue.tracker).toBeDefined();
      expect(issue.status).toBeDefined();
      expect(issue.priority).toBeDefined();
    });

    await t.step("POST /issues.json should create an issue", async () => {
      const projects = await listProjects(e2eContext);
      const project = projects.find((p) => p.identifier === "e2e-test-project");
      expect(project).toBeDefined();

      const issues = await list(e2eContext, {
        projectId: project!.id,
      });
      expect(issues.length).toBeGreaterThan(0);

      await createIssue(e2eContext, {
        projectId: project!.id,
        trackerId: issues[0].tracker.id,
        statusId: issues[0].status.id,
        priorityId: issues[0].priority.id,
        subject: "E2E Created Issue",
        description: "Created by E2E test",
      });
    });

    await t.step(
      "POST /issues.json with a custom field value should persist it",
      async () => {
        // Look up the id instead of hardcoding it: the server has
        // pre-existing data, and this custom field's id is an environment
        // detail rather than something this test should assume.
        const customFieldsResponse = await fetch(
          `${e2eContext.endpoint}/custom_fields.json`,
          { headers: { "X-Redmine-API-Key": e2eContext.apiKey } },
        );
        expect(customFieldsResponse.ok).toBe(true);
        const customFieldsData = await customFieldsResponse.json() as {
          custom_fields: { id: number; name: string }[];
        };
        const customField = customFieldsData.custom_fields.find(
          (f) => f.name === "E2E CF",
        );
        expect(customField).toBeDefined();

        const projects = await listProjects(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await list(e2eContext, {
          projectId: project!.id,
        });
        expect(issues.length).toBeGreaterThan(0);

        const subject = "E2E Issue With Custom Field";
        await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
          customFields: [{ id: customField!.id, value: "e2e custom value" }],
        });

        const listAfter = await list(e2eContext, {
          projectId: project!.id,
        });
        const created = listAfter.find((i) => i.subject === subject);
        expect(created).toBeDefined();

        const issue = await show(e2eContext, created!.id);
        const persisted = issue.customFields?.find(
          (f) => f.id === customField!.id,
        );
        expect(persisted).toBeDefined();
        expect(persisted!.value).toStrictEqual("e2e custom value");
      },
    );

    await t.step("PUT /issues/:id.json should update an issue", async () => {
      const issues = await list(e2eContext, {});
      const issue = issues.find((i) => i.subject === "E2E Created Issue");
      expect(issue).toBeDefined();

      await update(e2eContext, issue!.id, {
        subject: "E2E Updated Issue",
        doneRatio: 90,
        isPrivate: true,
        startDate: new Date("2026-07-01"),
      });

      const showIssue = await show(e2eContext, issue!.id);
      expect(showIssue.subject).toStrictEqual("E2E Updated Issue");
      expect(showIssue.doneRatio).toStrictEqual(90);
      expect(showIssue.isPrivate).toStrictEqual(true);
      expect(showIssue.startDate).toBeDefined();
      expect(showIssue.startDate?.toISOString().slice(0, 10))
        .toStrictEqual(
          "2026-07-01",
        );
    });

    await t.step(
      "GET /issues.json with limit: 1 should return exactly one issue",
      async () => {
        const projects = await listProjects(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await list(e2eContext, {
          projectId: project!.id,
        });
        expect(issues.length).toBeGreaterThan(0);

        // Ensure at least two issues exist on the server so that a
        // `limit: 1` result can only be explained by the limit being
        // honored, not by there happening to be a single issue.
        const subject = "E2E Limit Test Issue";
        await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
          description: "Created by E2E test to exercise list limit",
        });

        // Cleanup looks the issue up by subject because createIssue does
        // not return the created id.
        try {
          const limited = await list(e2eContext, { limit: 1 });
          expect(limited.length).toStrictEqual(1);
        } finally {
          const cleanupList = await list(e2eContext, {
            projectId: project!.id,
          });
          // Delete every match, not just one: runs that predate this
          // cleanup left issues with the same subject behind.
          const leftovers = cleanupList.filter((i) => i.subject === subject);
          for (const leftover of leftovers) {
            await deleteIssue(e2eContext, leftover.id);
          }
        }
      },
    );

    await t.step("DELETE /issues/:id.json should delete an issue", async () => {
      const issues = await list(e2eContext, {});
      const issue = issues.find((i) => i.subject === "E2E Updated Issue");
      expect(issue).toBeDefined();

      await deleteIssue(e2eContext, issue!.id);

      await expect(show(e2eContext, issue!.id)).rejects.toThrow();
    });
  },
});
