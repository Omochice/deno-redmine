import { assert } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/issue-statuses/list.ts";

Deno.test("E2E: Issue Statuses API", async (t) => {
  await t.step(
    "GET /issue_statuses.json should return default issue statuses",
    async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(
        result.value.length > 0,
        "Redmine should have default issue statuses",
      );
      assert(typeof result.value[0].id === "number");
      assert(typeof result.value[0].name === "string");
      assert(typeof result.value[0].isClosed === "boolean");
    },
  );
});
