import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { search } from "../search/search.ts";

Deno.test({
  name: "E2E: Search API",
  fn: async (t) => {
    await t.step(
      "GET /search.json should return an array of results",
      async () => {
        // The result set may be empty depending on how far Redmine's indexing
        // has progressed, so only the response shape is asserted.
        const results = await Array.fromAsync(
          search(e2eContext, { q: "E2E" }),
        );
        expect(Array.isArray(results)).toBe(true);
        for (const item of results) {
          expect(item.datetime).toBeInstanceOf(Date);
        }
      },
    );

    await t.step(
      "GET /search.json should return an empty array when nothing matches",
      async () => {
        const results = await Array.fromAsync(
          search(e2eContext, { q: "b6f1c2d49e7a4c0f8a35d17e90c4f2ab" }),
        );
        expect(results).toStrictEqual([]);
      },
    );

    await t.step(
      "GET /search.json should return an empty array when the query is too short to search",
      async () => {
        // Redmine skips the search for a one-character query and answers
        // `total_count: null`, unlike the `0` it answers for a query that
        // merely matches nothing.
        const results = await Array.fromAsync(search(e2eContext, { q: "a" }));
        expect(results).toStrictEqual([]);
      },
    );
  },
});
