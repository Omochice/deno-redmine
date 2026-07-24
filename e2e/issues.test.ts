import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../issues/list.ts";
import { show } from "../issues/show.ts";
import { createIssue } from "../issues/create.ts";
import { update } from "../issues/update.ts";
import { deleteIssue } from "../issues/delete.ts";
import { create as createRelation } from "../issue-relations/create.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Issues API",
  fn: async (t) => {
    await t.step("GET /issues.json should return issues", async () => {
      const issues = await Array.fromAsync(list(e2eContext, {}));
      expect(issues.length).toBeGreaterThan(0);
    });

    await t.step("GET /issues/:id.json should return an issue", async () => {
      const issues = await Array.fromAsync(list(e2eContext, {}));
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
      const projects = await Array.fromAsync(listProjects(e2eContext));
      const project = projects.find((p) => p.identifier === "e2e-test-project");
      expect(project).toBeDefined();

      const issues = await Array.fromAsync(list(e2eContext, {
        projectId: project!.id,
      }));
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

        const projects = await Array.fromAsync(listProjects(e2eContext));
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
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

        const listAfter = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
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
      const issues = await Array.fromAsync(list(e2eContext, {}));
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
        const projects = await Array.fromAsync(listProjects(e2eContext));
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
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
          const limited = await Array.fromAsync(
            list(e2eContext, { limit: 1 }),
          );
          expect(limited.length).toStrictEqual(1);
        } finally {
          const cleanupList = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          // Delete every match, not just one: runs that predate this
          // cleanup left issues with the same subject behind.
          const leftovers = cleanupList.filter((i) => i.subject === subject);
          for (const leftover of leftovers) {
            await deleteIssue(e2eContext, leftover.id);
          }
        }
      },
    );

    await t.step(
      "GET /issues.json with include: attachments should return attachments",
      async () => {
        const projects = await Array.fromAsync(listProjects(e2eContext));
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
        expect(issues.length).toBeGreaterThan(0);

        const subject = "E2E Include Attachments Issue";
        await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
          description: "Created by E2E test to exercise list include",
        });

        try {
          const created = (await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }))).find((i) => i.subject === subject);
          expect(created).toBeDefined();

          const headers = {
            "Content-Type": "application/json",
            "X-Redmine-API-Key": e2eContext.apiKey,
          };
          const filename = "e2e-include-attachment.txt";

          const uploadResponse = await fetch(
            `${e2eContext.endpoint}/uploads.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "X-Redmine-API-Key": e2eContext.apiKey,
              },
              body: new TextEncoder().encode("E2E include attachment content"),
            },
          );
          if (!uploadResponse.ok) {
            await uploadResponse.body?.cancel();
            console.warn("Skipping: file upload is restricted on this Redmine");
            return;
          }
          const uploadData = await uploadResponse.json();
          const token = uploadData.upload?.token;
          if (token === undefined) {
            console.warn("Skipping: upload did not return a token");
            return;
          }

          const attachResponse = await fetch(
            `${e2eContext.endpoint}/issues/${created!.id}.json`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                issue: {
                  uploads: [
                    { token, filename, content_type: "text/plain" },
                  ],
                },
              }),
            },
          );
          const attached = attachResponse.ok;
          await attachResponse.body?.cancel();
          if (!attached) {
            console.warn("Skipping: could not attach upload to issue");
            return;
          }

          const listed = await Array.fromAsync(
            list(e2eContext, {
              projectId: project!.id,
              include: "attachments",
            }),
          );
          const listedIssue = listed.find((i) => i.subject === subject);
          expect(listedIssue).toBeDefined();
          expect(listedIssue!.attachments).toBeDefined();
          expect(
            listedIssue!.attachments?.some((a) => a.filename === filename),
          ).toBe(true);
        } finally {
          const cleanupList = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          const leftovers = cleanupList.filter((i) => i.subject === subject);
          for (const leftover of leftovers) {
            await deleteIssue(e2eContext, leftover.id);
          }
        }
      },
    );

    await t.step(
      "GET /issues.json with include: relations should return relations",
      async () => {
        const projects = await Array.fromAsync(listProjects(e2eContext));
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
        expect(issues.length).toBeGreaterThan(0);

        const sourceSubject = "E2E Include Relations Source";
        const targetSubject = "E2E Include Relations Target";
        for (const subject of [sourceSubject, targetSubject]) {
          await createIssue(e2eContext, {
            projectId: project!.id,
            trackerId: issues[0].tracker.id,
            statusId: issues[0].status.id,
            priorityId: issues[0].priority.id,
            subject,
            description: "Created by E2E test to exercise list include",
          });
        }

        try {
          const created = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          const source = created.find((i) => i.subject === sourceSubject);
          const target = created.find((i) => i.subject === targetSubject);
          expect(source).toBeDefined();
          expect(target).toBeDefined();

          await createRelation(e2eContext, source!.id, {
            issueToId: target!.id,
            relationType: "relates",
          });

          const listed = await Array.fromAsync(
            list(e2eContext, {
              projectId: project!.id,
              include: "relations",
            }),
          );
          const listedIssue = listed.find((i) => i.subject === sourceSubject);
          expect(listedIssue).toBeDefined();
          expect(listedIssue!.relations).toBeDefined();
          expect(
            listedIssue!.relations?.some((r) => r.issueToId === target!.id),
          ).toBe(true);
        } finally {
          const cleanupList = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          const leftovers = cleanupList.filter((i) =>
            i.subject === sourceSubject || i.subject === targetSubject
          );
          for (const leftover of leftovers) {
            await deleteIssue(e2eContext, leftover.id);
          }
        }
      },
    );

    await t.step(
      "GET /issues.json with include: [attachments, relations] should return both",
      async () => {
        const projects = await Array.fromAsync(listProjects(e2eContext));
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await Array.fromAsync(list(e2eContext, {
          projectId: project!.id,
        }));
        expect(issues.length).toBeGreaterThan(0);

        const sourceSubject = "E2E Combined Include Source";
        const targetSubject = "E2E Combined Include Target";
        for (const subject of [sourceSubject, targetSubject]) {
          await createIssue(e2eContext, {
            projectId: project!.id,
            trackerId: issues[0].tracker.id,
            statusId: issues[0].status.id,
            priorityId: issues[0].priority.id,
            subject,
            description: "Created by E2E test to exercise list include",
          });
        }

        try {
          const created = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          const source = created.find((i) => i.subject === sourceSubject);
          const target = created.find((i) => i.subject === targetSubject);
          expect(source).toBeDefined();
          expect(target).toBeDefined();

          const headers = {
            "Content-Type": "application/json",
            "X-Redmine-API-Key": e2eContext.apiKey,
          };
          const filename = "e2e-combined-include-attachment.txt";

          const uploadResponse = await fetch(
            `${e2eContext.endpoint}/uploads.json`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "X-Redmine-API-Key": e2eContext.apiKey,
              },
              body: new TextEncoder().encode(
                "E2E combined include attachment content",
              ),
            },
          );
          if (!uploadResponse.ok) {
            await uploadResponse.body?.cancel();
            console.warn("Skipping: file upload is restricted on this Redmine");
            return;
          }
          const uploadData = await uploadResponse.json();
          const token = uploadData.upload?.token;
          if (token === undefined) {
            console.warn("Skipping: upload did not return a token");
            return;
          }

          const attachResponse = await fetch(
            `${e2eContext.endpoint}/issues/${source!.id}.json`,
            {
              method: "PUT",
              headers,
              body: JSON.stringify({
                issue: {
                  uploads: [
                    { token, filename, content_type: "text/plain" },
                  ],
                },
              }),
            },
          );
          const attached = attachResponse.ok;
          await attachResponse.body?.cancel();
          if (!attached) {
            console.warn("Skipping: could not attach upload to issue");
            return;
          }

          await createRelation(e2eContext, source!.id, {
            issueToId: target!.id,
            relationType: "relates",
          });

          const listed = await Array.fromAsync(
            list(e2eContext, {
              projectId: project!.id,
              include: ["attachments", "relations"],
            }),
          );
          const listedIssue = listed.find((i) => i.subject === sourceSubject);
          expect(listedIssue).toBeDefined();
          expect(listedIssue!.attachments).toBeDefined();
          expect(
            listedIssue!.attachments?.some((a) => a.filename === filename),
          ).toBe(true);
          expect(listedIssue!.relations).toBeDefined();
          expect(
            listedIssue!.relations?.some((r) => r.issueToId === target!.id),
          ).toBe(true);
        } finally {
          const cleanupList = await Array.fromAsync(list(e2eContext, {
            projectId: project!.id,
          }));
          const leftovers = cleanupList.filter((i) =>
            i.subject === sourceSubject || i.subject === targetSubject
          );
          for (const leftover of leftovers) {
            await deleteIssue(e2eContext, leftover.id);
          }
        }
      },
    );

    await t.step("DELETE /issues/:id.json should delete an issue", async () => {
      const issues = await Array.fromAsync(list(e2eContext, {}));
      const issue = issues.find((i) => i.subject === "E2E Updated Issue");
      expect(issue).toBeDefined();

      await deleteIssue(e2eContext, issue!.id);

      await expect(show(e2eContext, issue!.id)).rejects.toThrow();
    });
  },
});
