import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../issue-relations/list.ts";
import { show } from "../issue-relations/show.ts";
import { create } from "../issue-relations/create.ts";
import { deleteRelation } from "../issue-relations/delete.ts";
import { list as listIssues } from "../issues/list.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Issue Relations API",
  fn: async (t) => {
    const projects = await listProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    const issues = await listIssues(e2eContext, {
      projectId: project!.id,
    });
    expect(issues.length).toBeGreaterThan(0);
    const firstIssue = issues[0];

    // A relation needs two distinct issues. Seed a second one via a raw POST
    // when the project has only one, reusing the first issue's tracker,
    // status and priority so the created issue is valid for this project.
    let secondIssueId: number | undefined = issues.find((
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
    expect(secondIssueId).toBeDefined();
    const targetIssueId = secondIssueId;

    await t.step(
      "POST /issues/:issue_id/relations.json should create a relation",
      async () => {
        await create(e2eContext, firstIssue.id, {
          issueToId: targetIssueId,
          relationType: "relates",
        });
      },
    );

    await t.step(
      "GET /issues/:issue_id/relations.json should return relations",
      async () => {
        const relations = await list(e2eContext, firstIssue.id);
        const relation = relations.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation).toBeDefined();
        expect(relation!.issueId).toStrictEqual(firstIssue.id);
      },
    );

    await t.step(
      "GET /relations/:id.json should return a relation",
      async () => {
        const relations = await list(e2eContext, firstIssue.id);
        const relation = relations.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation).toBeDefined();

        const shown = await show(e2eContext, relation!.id);
        expect(shown.id).toStrictEqual(relation!.id);
        expect(shown.issueId).toStrictEqual(firstIssue.id);
        expect(shown.issueToId).toStrictEqual(targetIssueId);
        expect(shown.relationType).toStrictEqual("relates");
      },
    );

    await t.step(
      "DELETE /relations/:id.json should delete a relation",
      async () => {
        const relations = await list(e2eContext, firstIssue.id);
        const relation = relations.find((r) =>
          r.issueToId === targetIssueId && r.relationType === "relates"
        );
        expect(relation).toBeDefined();

        await deleteRelation(e2eContext, relation!.id);

        await expect(show(e2eContext, relation!.id)).rejects.toThrow();
      },
    );
  },
});
