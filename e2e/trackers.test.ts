import { assert } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/trackers/list.ts";

Deno.test("E2E: Trackers API", async (t) => {
  await t.step(
    "GET /trackers.json should return default trackers",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(result.value.length > 0, "Redmine should have default trackers");
      assert(typeof result.value[0].id === "number");
      assert(typeof result.value[0].name === "string");
    },
  );
});
