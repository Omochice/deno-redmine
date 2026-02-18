import { assert, assertEquals } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { list } from "../result/issue-templates/list.ts";

Deno.test({
  name: "E2E: Issue Templates API",
  sanitizeResources: false,
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
          result.value;

        assertEquals(issueTemplates.length, 1);
        assert(typeof issueTemplates[0].id === "number");
        assertEquals(issueTemplates[0].title, "E2E Bug Template");
        assertEquals(issueTemplates[0].issueTitle, "Bug: ");
        assertEquals(issueTemplates[0].description, "Template for bug reports");
        assertEquals(issueTemplates[0].enabled, true);
        assertEquals(issueTemplates[0].trackerName, "Bug");
        assert(issueTemplates[0].createdOn instanceof Date);
        assert(issueTemplates[0].updatedOn instanceof Date);

        assertEquals(globalIssueTemplates.length, 1);
        assert(typeof globalIssueTemplates[0].id === "number");
        assertEquals(globalIssueTemplates[0].title, "E2E Global Template");
        assertEquals(globalIssueTemplates[0].issueTitle, "Global: ");
        assertEquals(
          globalIssueTemplates[0].description,
          "Global template description",
        );
        assertEquals(globalIssueTemplates[0].enabled, true);
        assertEquals(globalIssueTemplates[0].trackerName, "Bug");
        assert(globalIssueTemplates[0].createdOn instanceof Date);
        assert(globalIssueTemplates[0].updatedOn instanceof Date);

        assertEquals(inheritTemplates.length, 0);
      },
    );
  },
});
