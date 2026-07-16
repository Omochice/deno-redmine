import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/custom-fields/list.ts";

Deno.test("E2E: Custom Fields API", async (t) => {
  await t.step(
    "GET /custom_fields.json should return an array of custom fields",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      // e2e/setup.ts seeds an "E2E CF" issue custom field, so the list is
      // non-empty and contains it.
      const seeded = result.value.find((cf) => cf.name === "E2E CF");
      assert(seeded !== undefined);
      assertEquals(seeded.fieldFormat, "string");
    },
  );
});
