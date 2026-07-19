import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { search } from "../throwable/search/search.ts";

Deno.test({
  name: "E2E: Search API",
  fn: async (t) => {
    await t.step(
      "GET /search.json should return an array of results",
      async () => {
        // The result set may be empty depending on how far Redmine's indexing
        // has progressed, so only the response shape is asserted.
        const results = await search(e2eContext, { q: "E2E" });
        expect(Array.isArray(results)).toBe(true);
        for (const item of results) {
          expect(item.datetime).toBeInstanceOf(Date);
        }
      },
    );
  },
});
