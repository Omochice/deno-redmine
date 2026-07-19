import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../throwable/issue-statuses/list.ts";

Deno.test("E2E: Issue Statuses API", async (t) => {
  await t.step(
    "GET /issue_statuses.json should return default issue statuses",
    async () => {
      const statuses = await fetchList(e2eContext);
      expect(
        statuses.length,
        "Redmine should have default issue statuses",
      ).toBeGreaterThan(0);
    },
  );
});
