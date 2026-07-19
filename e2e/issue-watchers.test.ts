import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { listIssues } from "../throwable/issues/list.ts";
import { addWatcher } from "../throwable/issues/add-watcher.ts";
import { removeWatcher } from "../throwable/issues/remove-watcher.ts";

async function fetchCurrentUserId(): Promise<number | undefined> {
  const response = await fetch(`${e2eContext.endpoint}/users/current.json`, {
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": e2eContext.apiKey,
    },
  });
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const body = await response.json() as { user?: { id?: number } };
  return body.user?.id;
}

Deno.test({
  name: "E2E: Issue watchers API",
  fn: async (t) => {
    const issues = await listIssues(e2eContext, { limit: 1 });
    const issue = issues[0];
    if (issue === undefined) {
      // Nothing to watch when the seeded project holds no issues.
      return;
    }

    const userId = await fetchCurrentUserId();
    if (userId === undefined) {
      return;
    }

    await t.step(
      "POST /issues/:id/watchers.json should add a watcher",
      async () => {
        await expect(addWatcher(e2eContext, issue.id, userId)).resolves
          .toBeUndefined();
      },
    );

    await t.step(
      "DELETE /issues/:id/watchers/:user_id.json should remove a watcher",
      async () => {
        await expect(removeWatcher(e2eContext, issue.id, userId)).resolves
          .toBeUndefined();
      },
    );
  },
});
