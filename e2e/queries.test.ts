import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../queries/list.ts";

Deno.test("E2E: Queries API", async (t) => {
  await t.step(
    "GET /queries.json should return the list of queries",
    async () => {
      const queries = await fetchList(e2eContext);
      // Saved queries are user-created, so a freshly provisioned Redmine has
      // none; a successful parse already proves the response matches the
      // schema regardless of length.
      expect(Array.isArray(queries)).toBe(true);
    },
  );
});
