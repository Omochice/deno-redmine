import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/issue-relations/list.ts";
import { show } from "../result/issue-relations/show.ts";
import { create } from "../result/issue-relations/create.ts";
import { deleteRelation } from "../result/issue-relations/delete.ts";
import { listIssues } from "../result/issues/list.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Issue Relations API",
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
    const firstIssue = issuesResult._unsafeUnwrap()[0];

    // A relation needs two distinct issues. Seed a second one via a raw POST
    // when the project has only one, reusing the first issue's tracker,
    // status and priority so the created issue is valid for this project.
    let secondIssueId: number | undefined = issuesResult._unsafeUnwrap().find((
      i,
    ) => i.id !== firstIssue.id)?.id;
    if (secondIssueId === undefined) {
      const response = await fetch(`${e2eContext.endpoint}/issues.json`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Redmine-API-Key": e2eContext.apiKey,
        },
        body: JSON.stringify({
          issue: {
            project_id: project!.id,
            tracker_id: firstIssue.tracker.id,
            status_id: firstIssue.status.id,
            priority_id: firstIssue.priority.id,
            subject: "E2E Relation Target Issue",
          },
        }),
      });
      expect(response.ok).toBe(true);
      const created = await response.json() as { issue: { id: number } };
      secondIssueId = created.issue.id;
    }
    expect(secondIssueId !== undefined).toBe(true);
    const targetIssueId = secondIssueId;

    await t.step(
      "POST /issues/:issue_id/relations.json should create a relation",
      async () => {
        const result = await create(e2eContext, firstIssue.id, {
          issueToId: targetIssueId,
          relationType: "relates",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /issues/:issue_id/relations.json should return relations",
      async () => {
        const result = await fetchList(e2eContext, firstIssue.id);
        expect(result.isOk()).toBe(true);
        const relation = result._unsafeUnwrap().find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation !== undefined).toBe(true);
        expect(relation!.issueId).toEqual(firstIssue.id);
      },
    );

    await t.step(
      "GET /relations/:id.json should return a relation",
      async () => {
        const listResult = await fetchList(e2eContext, firstIssue.id);
        expect(listResult.isOk()).toBe(true);
        const relation = listResult._unsafeUnwrap().find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation !== undefined).toBe(true);

        const result = await show(e2eContext, relation!.id);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().id).toEqual(relation!.id);
        expect(result._unsafeUnwrap().issueId).toEqual(firstIssue.id);
        expect(result._unsafeUnwrap().issueToId).toEqual(targetIssueId);
        expect(result._unsafeUnwrap().relationType).toEqual("relates");
      },
    );

    await t.step(
      "DELETE /relations/:id.json should delete a relation",
      async () => {
        const listResult = await fetchList(e2eContext, firstIssue.id);
        expect(listResult.isOk()).toBe(true);
        const relation = listResult._unsafeUnwrap().find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation !== undefined).toBe(true);

        const result = await deleteRelation(e2eContext, relation!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, relation!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
