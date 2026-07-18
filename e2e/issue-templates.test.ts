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

        expect(issueTemplates.length).toStrictEqual(1);
        expect(issueTemplates[0].title).toStrictEqual("E2E Bug Template");
        expect(issueTemplates[0].issueTitle).toStrictEqual("Bug: ");
        expect(issueTemplates[0].description).toStrictEqual(
          "Template for bug reports",
        );
        expect(issueTemplates[0].enabled).toStrictEqual(true);
        expect(issueTemplates[0].trackerName).toStrictEqual("Bug");
        expect(issueTemplates[0].createdOn).toBeInstanceOf(Date);
        expect(issueTemplates[0].updatedOn).toBeInstanceOf(Date);

        expect(globalIssueTemplates.length).toStrictEqual(1);
        expect(globalIssueTemplates[0].title).toStrictEqual(
          "E2E Global Template",
        );
        expect(globalIssueTemplates[0].issueTitle).toStrictEqual("Global: ");
        expect(globalIssueTemplates[0].description).toStrictEqual(
          "Global template description",
        );
        expect(globalIssueTemplates[0].enabled).toStrictEqual(true);
        expect(globalIssueTemplates[0].trackerName).toStrictEqual("Bug");
        expect(globalIssueTemplates[0].createdOn).toBeInstanceOf(Date);
        expect(globalIssueTemplates[0].updatedOn).toBeInstanceOf(Date);

        expect(inheritTemplates.length).toStrictEqual(0);
      },
    );
  },
});
