import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { search } from "../result/search/search.ts";

Deno.test({
  name: "E2E: Search API",
  fn: async (t) => {
    await t.step(
      "GET /search.json should return an array of results",
      async () => {
        // The result set may be empty depending on how far Redmine's indexing
        // has progressed, so only the response shape is asserted.
        const result = await search(e2eContext, { q: "E2E" });
        assert(result.isOk());
        assert(Array.isArray(result.value));
        for (const item of result.value) {
          assert(item.datetime instanceof Date);
        }
      },
    );
  },
});
