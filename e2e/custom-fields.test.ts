import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../custom-fields/list.ts";

Deno.test("E2E: Custom Fields API", async (t) => {
  await t.step(
    "GET /custom_fields.json should return an array of custom fields",
    async () => {
      const customFields = await fetchList(e2eContext);
      expect(Array.isArray(customFields)).toBe(true);
      // e2e/setup.ts seeds an "E2E CF" issue custom field, so the list is
      // non-empty and contains it.
      const seeded = customFields.find((cf) => cf.name === "E2E CF");
      expect(seeded).toBeDefined();
      expect(seeded!.fieldFormat).toStrictEqual("string");
    },
  );
});
