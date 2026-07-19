import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { listIssues } from "../throwable/issues/list.ts";
import { show } from "../throwable/issues/show.ts";
import { createIssue } from "../throwable/issues/create.ts";
import { update } from "../throwable/issues/update.ts";
import { deleteIssue } from "../throwable/issues/delete.ts";
import { fetchList as fetchProjects } from "../throwable/projects/list.ts";
import { update as updateJournal } from "../throwable/journals/update.ts";

Deno.test({
  name: "E2E: Journals API",
  fn: async (t) => {
    const subject = "E2E Journal Issue";
    let issueId: number | undefined;
    let journalId: number | undefined;

    await t.step(
      "POST /issues.json should create an issue to attach a journal to",
      async () => {
        const projects = await fetchProjects(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-test-project"
        );
        expect(project).toBeDefined();

        const issues = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        expect(issues.length).toBeGreaterThan(0);

        await createIssue(e2eContext, {
          projectId: project!.id,
          trackerId: issues[0].tracker.id,
          statusId: issues[0].status.id,
          priorityId: issues[0].priority.id,
          subject,
        });

        // createIssue does not return the created id, so it is looked up
        // by subject, mirroring the pattern in e2e/issues.test.ts.
        const listAfter = await listIssues(e2eContext, {
          projectId: project!.id,
        });
        const createdIssue = listAfter.find((i) => i.subject === subject);
        expect(createdIssue).toBeDefined();
        issueId = createdIssue!.id;
      },
    );

    await t.step(
      "PUT /issues/:id.json with notes should create a journal",
      async () => {
        await expect(
          update(e2eContext, issueId!, {
            notes: "journal note to edit",
          }),
        ).resolves.toBeUndefined();
      },
    );

    await t.step(
      "GET /issues/:id.json?include=journals should return the created journal",
      async () => {
        const issue = await show(e2eContext, issueId!, ["journals"]);
        const journal = issue.journals?.find((j) =>
          j.notes === "journal note to edit"
        );
        expect(journal).toBeDefined();
        journalId = journal!.id;
      },
    );

    await t.step(
      "PUT /journals/:id.json should update the journal note",
      async () => {
        await expect(
          updateJournal(e2eContext, journalId!, {
            notes: "edited journal note",
          }),
        ).resolves.toBeUndefined();
      },
    );

    await t.step(
      "GET /issues/:id.json?include=journals should reflect the edited note",
      async () => {
        const issue = await show(e2eContext, issueId!, ["journals"]);
        const journal = issue.journals?.find((j) => j.id === journalId);
        expect(journal).toBeDefined();
        expect(journal!.notes).toStrictEqual("edited journal note");
      },
    );

    await t.step(
      "DELETE /issues/:id.json should clean up the created issue",
      async () => {
        await expect(deleteIssue(e2eContext, issueId!))
          .resolves.toBeUndefined();
      },
    );
  },
});
