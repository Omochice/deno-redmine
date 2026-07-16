import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/queries/list.ts";

Deno.test("E2E: Queries API", async (t) => {
  await t.step(
    "GET /queries.json should return the list of queries",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      // Saved queries are user-created, so a freshly provisioned Redmine has
      // none; a successful parse already proves the response matches the
      // schema regardless of length.
      assert(Array.isArray(result.value));
    },
  );
});
