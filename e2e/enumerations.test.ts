import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import {
  listDocumentCategories,
  listIssuePriorities,
  listTimeEntryActivities,
} from "../result/enumerations/list.ts";

Deno.test("E2E: Enumerations API", async (t) => {
  // The e2e Redmine is provisioned without loading Redmine's default data, so
  // these enumeration listings can be empty; a successful parse already
  // proves the response matches the schema regardless of length.
  await t.step(
    "GET /enumerations/issue_priorities.json should return an array",
    async () => {
      const result = await listIssuePriorities(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
    },
  );

  await t.step(
    "GET /enumerations/time_entry_activities.json should return an array",
    async () => {
      const result = await listTimeEntryActivities(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
    },
  );

  await t.step(
    "GET /enumerations/document_categories.json should return an array",
    async () => {
      const result = await listDocumentCategories(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
    },
  );
});
