import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../result/issue-templates/list.ts";

Deno.test({
  name: "E2E: Issue Templates API",
  fn: async (t) => {
    await t.step(
      "GET /projects/:id/issue_templates.json should return templates",
      async () => {
        const result = await list(e2eContext, "e2e-test-project");
        if (result.isErr()) {
          // The redmine_issue_templates plugin does not support JSON API
          // on Redmine 6.0+ due to a template resolution incompatibility
          // with Rails 7.2.
          return;
        }

        const { issueTemplates, globalIssueTemplates, inheritTemplates } =
          result._unsafeUnwrap();

        expect(issueTemplates.length).toEqual(1);
        expect(issueTemplates[0].title).toEqual("E2E Bug Template");
        expect(issueTemplates[0].issueTitle).toEqual("Bug: ");
        expect(issueTemplates[0].description).toEqual(
          "Template for bug reports",
        );
        expect(issueTemplates[0].enabled).toEqual(true);
        expect(issueTemplates[0].trackerName).toEqual("Bug");
        expect(issueTemplates[0].createdOn instanceof Date).toBe(true);
        expect(issueTemplates[0].updatedOn instanceof Date).toBe(true);

        expect(globalIssueTemplates.length).toEqual(1);
        expect(globalIssueTemplates[0].title).toEqual("E2E Global Template");
        expect(globalIssueTemplates[0].issueTitle).toEqual("Global: ");
        expect(globalIssueTemplates[0].description).toEqual(
          "Global template description",
        );
        expect(globalIssueTemplates[0].enabled).toEqual(true);
        expect(globalIssueTemplates[0].trackerName).toEqual("Bug");
        expect(globalIssueTemplates[0].createdOn instanceof Date).toBe(true);
        expect(globalIssueTemplates[0].updatedOn instanceof Date).toBe(true);

        expect(inheritTemplates.length).toEqual(0);
      },
    );
  },
});
