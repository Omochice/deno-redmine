import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/issue-relations/list.ts";
import { show } from "../result/issue-relations/show.ts";
import { create } from "../result/issue-relations/create.ts";
import { deleteRelation } from "../result/issue-relations/delete.ts";
import { listIssues } from "../result/issues/list.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Issue Relations API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
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
    const firstIssue = issuesResult.value[0];

    // A relation needs two distinct issues. Seed a second one via a raw POST
    // when the project has only one, reusing the first issue's tracker,
    // status and priority so the created issue is valid for this project.
    let secondIssueId: number | undefined = issuesResult.value.find((i) =>
      i.id !== firstIssue.id
    )?.id;
    if (secondIssueId === undefined) {
      const response = await fetch(`${e2eContext.endpoint}/issues.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Redmine-API-Key": e2eContext.apiKey,
        },
        body: JSON.stringify({
          issue: {
            project_id: project.id,
            tracker_id: firstIssue.tracker.id,
            status_id: firstIssue.status.id,
            priority_id: firstIssue.priority.id,
            subject: "E2E Relation Target Issue",
          },
        }),
      });
      assert(response.ok);
      const created = await response.json() as { issue: { id: number } };
      secondIssueId = created.issue.id;
    }
    assert(secondIssueId !== undefined);
    const targetIssueId = secondIssueId;

    await t.step(
      "POST /issues/:issue_id/relations.json should create a relation",
      async () => {
        const result = await create(e2eContext, firstIssue.id, {
          issueToId: targetIssueId,
          relationType: "relates",
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /issues/:issue_id/relations.json should return relations",
      async () => {
        const result = await fetchList(e2eContext, firstIssue.id);
        assert(result.isOk());
        const relation = result.value.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        assert(relation !== undefined);
        assertEquals(relation.issueId, firstIssue.id);
      },
    );

    await t.step(
      "GET /relations/:id.json should return a relation",
      async () => {
        const listResult = await fetchList(e2eContext, firstIssue.id);
        assert(listResult.isOk());
        const relation = listResult.value.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        assert(relation !== undefined);

        const result = await show(e2eContext, relation.id);
        assert(result.isOk());
        assertEquals(result.value.id, relation.id);
        assertEquals(result.value.issueId, firstIssue.id);
        assertEquals(result.value.issueToId, targetIssueId);
        assertEquals(result.value.relationType, "relates");
      },
    );

    await t.step(
      "DELETE /relations/:id.json should delete a relation",
      async () => {
        const listResult = await fetchList(e2eContext, firstIssue.id);
        assert(listResult.isOk());
        const relation = listResult.value.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        assert(relation !== undefined);

        const result = await deleteRelation(e2eContext, relation.id);
        assert(result.isOk());

        const showResult = await show(e2eContext, relation.id);
        assert(showResult.isErr());
      },
    );
  },
});
