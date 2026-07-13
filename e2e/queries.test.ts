import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/queries/list.ts";

Deno.test("E2E: Queries API", async (t) => {
  await t.step(
    "GET /queries.json should return the list of queries",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
      assert(result.value.length > 0, "Redmine should have default queries");
      assert(typeof result.value[0].id === "number");
      assert(typeof result.value[0].name === "string");
      assert(typeof result.value[0].isPublic === "boolean");
    },
  );
});
