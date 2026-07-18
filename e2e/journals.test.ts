import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { listIssues } from "../result/issues/list.ts";
import { show } from "../result/issues/show.ts";
import { createIssue } from "../result/issues/create.ts";
import { update } from "../result/issues/update.ts";
import { deleteIssue } from "../result/issues/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";
import { update as updateJournal } from "../result/journals/update.ts";

Deno.test({
  name: "E2E: Journals API",
  fn: async (t) => {
    const subject = "E2E Journal Issue";
    let issueId: number | undefined;
    let journalId: number | undefined;

    await t.step(
      "POST /issues.json should create an issue to attach a journal to",
      async () => {
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

        const created = await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
        });
        expect(created.isOk()).toBe(true);

        // createIssue does not return the created id, so it is looked up
        // by subject, mirroring the pattern in e2e/issues.test.ts.
        const listAfter = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        expect(listAfter.isOk()).toBe(true);
        const createdIssue = listAfter._unsafeUnwrap().find((i) =>
          i.subject === subject
        );
        expect(createdIssue).toBeDefined();
        issueId = createdIssue!.id;
      },
    );

    await t.step(
      "PUT /issues/:id.json with notes should create a journal",
      async () => {
        const result = await update(e2eContext, issueId!, {
          notes: "journal note to edit",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /issues/:id.json?include=journals should return the created journal",
      async () => {
        const showResult = await show(e2eContext, issueId!, ["journals"]);
        expect(showResult.isOk()).toBe(true);
        const journal = showResult._unsafeUnwrap().journals?.find((j) =>
          j.notes === "journal note to edit"
        );
        expect(journal).toBeDefined();
        journalId = journal!.id;
      },
    );

    await t.step(
      "PUT /journals/:id.json should update the journal note",
      async () => {
        const result = await updateJournal(e2eContext, journalId!, {
          notes: "edited journal note",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /issues/:id.json?include=journals should reflect the edited note",
      async () => {
        const showResult = await show(e2eContext, issueId!, ["journals"]);
        expect(showResult.isOk()).toBe(true);
        const journal = showResult._unsafeUnwrap().journals?.find((j) =>
          j.id === journalId
        );
        expect(journal).toBeDefined();
        expect(journal!.notes).toStrictEqual("edited journal note");
      },
    );

    await t.step(
      "DELETE /issues/:id.json should clean up the created issue",
      async () => {
        const deleted = await deleteIssue(e2eContext, issueId!);
        expect(deleted.isOk()).toBe(true);
      },
    );
  },
});
