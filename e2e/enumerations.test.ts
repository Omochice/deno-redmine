import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import {
  listDocumentCategories,
  listIssuePriorities,
  listTimeEntryActivities,
} from "../result/enumerations/list.ts";

Deno.test("E2E: Enumerations API", async (t) => {
  // The e2e Redmine is provisioned without loading Redmine's default data, so
  // these enumeration listings can be empty; assert the shape and only inspect
  // fields when an entry actually exists.
  await t.step(
    "GET /enumerations/issue_priorities.json should return an array",
    async () => {
      const result = await listIssuePriorities(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      if (result.value.length > 0) {
        assert(typeof result.value[0].id === "number");
        assert(typeof result.value[0].name === "string");
        assert(typeof result.value[0].isDefault === "boolean");
        assert(typeof result.value[0].active === "boolean");
      }
    },
  );

  await t.step(
    "GET /enumerations/time_entry_activities.json should return an array",
    async () => {
      const result = await listTimeEntryActivities(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      if (result.value.length > 0) {
        assert(typeof result.value[0].id === "number");
        assert(typeof result.value[0].name === "string");
        assert(typeof result.value[0].isDefault === "boolean");
        assert(typeof result.value[0].active === "boolean");
      }
    },
  );

  await t.step(
    "GET /enumerations/document_categories.json should return an array",
    async () => {
      const result = await listDocumentCategories(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      if (result.value.length > 0) {
        assert(typeof result.value[0].id === "number");
        assert(typeof result.value[0].name === "string");
        assert(typeof result.value[0].isDefault === "boolean");
        assert(typeof result.value[0].active === "boolean");
      }
    },
  );
});
