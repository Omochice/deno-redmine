import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/custom-fields/list.ts";

Deno.test("E2E: Custom Fields API", async (t) => {
  await t.step(
    "GET /custom_fields.json should return an array of custom fields",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      // The seeded Redmine instance does not define any custom fields, so
      // only the response shape (not the content) is asserted here.
      for (const customField of result.value) {
        assert(typeof customField.id === "number");
        assert(typeof customField.name === "string");
        assert(typeof customField.customizedType === "string");
        assert(typeof customField.fieldFormat === "string");
      }
    },
  );
});
