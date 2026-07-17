import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { listIssues } from "../result/issues/list.ts";
import { show } from "../result/issues/show.ts";
import { createIssue } from "../result/issues/create.ts";
import { update } from "../result/issues/update.ts";
import { deleteIssue } from "../result/issues/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Issues API",
  fn: async (t) => {
    await t.step("GET /issues.json should return issues", async () => {
      const result = await listIssues(e2eContext, {});
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().length).toBeGreaterThan(0);
    });

    await t.step("GET /issues/:id.json should return an issue", async () => {
      const listResult = await listIssues(e2eContext, {});
      expect(listResult.isOk()).toBe(true);
      expect(listResult._unsafeUnwrap().length).toBeGreaterThan(0);
      const issueId = listResult._unsafeUnwrap()[0].id;

      const result = await show(e2eContext, issueId);
      expect(result.isOk()).toBe(true);
      const issue = result._unsafeUnwrap();
      expect(issue.id).toStrictEqual(issueId);
      expect(issue.project).toBeDefined();
      expect(issue.tracker).toBeDefined();
      expect(issue.status).toBeDefined();
      expect(issue.priority).toBeDefined();
    });

    await t.step("POST /issues.json should create an issue", async () => {
      const projectsResult = await fetchProjects(e2eContext);
      expect(projectsResult.isOk()).toBe(true);
      const project = projectsResult._unsafeUnwrap().find((p) =>
        p.identifier === "e2e-test-project"
      );
      expect(project).toBeDefined();

      const issuesBefore = await listIssues(e2eContext, {
        projectId: project!.id,
      });
      expect(issuesBefore.isOk()).toBe(true);
      const issues = issuesBefore._unsafeUnwrap();
      expect(issues.length).toBeGreaterThan(0);

      const result = await createIssue(e2eContext, {
        projectId: project!.id,
        trackerId: issues[0].tracker.id,
        statusId: issues[0].status.id,
        priorityId: issues[0].priority.id,
        subject: "E2E Created Issue",
        description: "Created by E2E test",
      });
      expect(result.isOk()).toBe(true);
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

        const projectsResult = await fetchProjects(e2eContext);
        expect(projectsResult.isOk()).toBe(true);
        const project = projectsResult._unsafeUnwrap().find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issuesBefore = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        expect(issuesBefore.isOk()).toBe(true);
        const issues = issuesBefore._unsafeUnwrap();
        expect(issues.length).toBeGreaterThan(0);

        const subject = "E2E Issue With Custom Field";
        const result = await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
          customFields: [{ id: customField!.id, value: "e2e custom value" }],
        });
        expect(result.isOk()).toBe(true);

        const listAfter = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        expect(listAfter.isOk()).toBe(true);
        const created = listAfter._unsafeUnwrap().find((i) =>
          i.subject === subject
        );
        expect(created).toBeDefined();

        const showResult = await show(e2eContext, created!.id);
        expect(showResult.isOk()).toBe(true);
        const persisted = showResult._unsafeUnwrap().customFields?.find(
          (f) => f.id === customField!.id,
        );
        expect(persisted).toBeDefined();
        expect(persisted!.value).toStrictEqual("e2e custom value");
      },
    );

    await t.step("PUT /issues/:id.json should update an issue", async () => {
      const listResult = await listIssues(e2eContext, {});
      expect(listResult.isOk()).toBe(true);
      const issue = listResult._unsafeUnwrap().find((i) =>
        i.subject === "E2E Created Issue"
      );
      expect(issue).toBeDefined();

      const result = await update(e2eContext, issue!.id, {
        subject: "E2E Updated Issue",
        doneRatio: 90,
        isPrivate: true,
        startDate: new Date("2026-07-01"),
      });
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, issue!.id);
      expect(showResult.isOk()).toBe(true);
      const showIssue = showResult._unsafeUnwrap();
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
        const projectsResult = await fetchProjects(e2eContext);
        expect(projectsResult.isOk()).toBe(true);
        const project = projectsResult._unsafeUnwrap().find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issuesInProject = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        expect(issuesInProject.isOk()).toBe(true);
        const issues = issuesInProject._unsafeUnwrap();
        expect(issues.length).toBeGreaterThan(0);

        // Ensure at least two issues exist on the server so that a
        // `limit: 1` result can only be explained by the limit being
        // honored, not by there happening to be a single issue.
        const subject = "E2E Limit Test Issue";
        const created = await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
          description: "Created by E2E test to exercise listIssues limit",
        });
        expect(created.isOk()).toBe(true);

        // Cleanup looks the issue up by subject because createIssue does
        // not return the created id.
        try {
          const result = await listIssues(e2eContext, { limit: 1 });
          expect(result.isOk()).toBe(true);
          expect(result._unsafeUnwrap().length).toStrictEqual(1);
        } finally {
          const cleanupList = await listIssues(e2eContext, {
            projectId: project!.id,
          });
          expect(cleanupList.isOk(), "cleanup listing must succeed").toBe(true);
          // Delete every match, not just one: runs that predate this
          // cleanup left issues with the same subject behind.
          const leftovers = cleanupList._unsafeUnwrap().filter((i) =>
            i.subject === subject
          );
          for (const leftover of leftovers) {
            const deleted = await deleteIssue(e2eContext, leftover.id);
            expect(deleted.isOk(), `cleanup must delete issue ${leftover.id}`)
              .toBe(true);
          }
        }
      },
    );

    await t.step("DELETE /issues/:id.json should delete an issue", async () => {
      const listResult = await listIssues(e2eContext, {});
      expect(listResult.isOk()).toBe(true);
      const issue = listResult._unsafeUnwrap().find((i) =>
        i.subject === "E2E Updated Issue"
      );
      expect(issue).toBeDefined();

      const result = await deleteIssue(e2eContext, issue!.id);
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, issue!.id);
      expect(showResult.isErr()).toBe(true);
    });
  },
});
