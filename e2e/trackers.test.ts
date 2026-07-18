import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/trackers/list.ts";

Deno.test("E2E: Trackers API", async (t) => {
  await t.step(
    "GET /trackers.json should return default trackers",
    async () => {
      const result = await fetchList(e2eContext);
      expect(result.isOk()).toBe(true);
      expect(
        result._unsafeUnwrap().length,
        "Redmine should have default trackers",
      ).toBeGreaterThan(0);
    },
  );
});
