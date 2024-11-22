import { listIssues } from "./list.ts";
import { assert } from "jsr:@std/assert@1.0.8";

import { context, invalidHandler, validHandler } from "./list.mock.ts";
import { setupServer } from "npm:msw@2.6.6/node";

const server = setupServer();
server.listen();

Deno.test("test for redmine issue 'list' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandler);
    const e = await listIssues(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandler);
      const e = await listIssues(context);
      assert(e.isErr());
    },
  );
});
