import { assert, assertEquals } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { listIssues } from "../result/issues/list.ts";
import { show } from "../result/issues/show.ts";
import { createIssue } from "../result/issues/create.ts";
import { update } from "../result/issues/update.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Issues API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    await t.step("GET /issues.json should return issues", async () => {
      const result = await listIssues(e2eContext, {});
      assert(result.isOk());
      assert(result.value.length > 0);
    });

    await t.step("GET /issues/:id.json should return an issue", async () => {
      const listResult = await listIssues(e2eContext, {});
      assert(listResult.isOk());
      assert(listResult.value.length > 0);
      const issueId = listResult.value[0].id;

      const result = await show(e2eContext, issueId);
      assert(result.isOk());
      assertEquals(result.value.id, issueId);
      assert(typeof result.value.subject === "string");
      assert(result.value.project !== undefined);
      assert(result.value.tracker !== undefined);
      assert(result.value.status !== undefined);
      assert(result.value.priority !== undefined);
    });

    await t.step("POST /issues.json should create an issue", async () => {
      const projectsResult = await fetchProjects(e2eContext);
      assert(projectsResult.isOk());
      const project = projectsResult.value.find((p) =>
        p.identifier === "e2e-test-project"
      );
      assert(project !== undefined);

      const issuesBefore = await listIssues(e2eContext, {
        projectId: project.id,
      });
      assert(issuesBefore.isOk());
      assert(issuesBefore.value.length > 0);

      const result = await createIssue(e2eContext, {
        projectId: project.id,
        trackerId: issuesBefore.value[0].tracker.id,
        statusId: issuesBefore.value[0].status.id,
        priorityId: issuesBefore.value[0].priority.id,
        subject: "E2E Created Issue",
        description: "Created by E2E test",
      });
      assert(result.isOk());
    });

    await t.step("PUT /issues/:id.json should update an issue", async () => {
      const listResult = await listIssues(e2eContext, {});
      assert(listResult.isOk());
      const issue = listResult.value.find((i) =>
        i.subject === "E2E Created Issue"
      );
      assert(issue !== undefined);

      const result = await update(e2eContext, issue.id, {
        subject: "E2E Updated Issue",
      });
      assert(result.isOk());

      const showResult = await show(e2eContext, issue.id);
      assert(showResult.isOk());
      assertEquals(showResult.value.subject, "E2E Updated Issue");
    });
  },
});
