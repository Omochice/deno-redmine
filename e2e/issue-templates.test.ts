import { assert } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { list } from "../result/issue-templates/list.ts";

Deno.test("E2E: Issue Templates API", async (t) => {
  await t.step(
    "GET /projects/:id/issue_templates.json should return templates",
    async () => {
      const result = await list(e2eContext, "e2e-test-project");
      assert(result.isOk());
      assert(
        result.value.issueTemplates.length > 0,
        "Should have project-specific templates",
      );
      assert(
        result.value.globalIssueTemplates.length > 0,
        "Should have global templates",
      );
      const template = result.value.issueTemplates[0];
      assert(typeof template.id === "number");
      assert(typeof template.title === "string");
      assert(typeof template.enabled === "boolean");
    },
  );
});
