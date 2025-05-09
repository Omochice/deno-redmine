import { show } from "./show.ts";
import { assert } from "jsr:@std/assert@1.0.13";

import { context, invalidHandler, validHandler } from "./show.mock.ts";
import { setupServer } from "npm:msw@2.8.1/node";

const server = setupServer();
server.listen();

Deno.test("test for redmine issue 'show' endpoint", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.resetHandlers(...validHandler);
    const e = await show(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandler);
      const e = await show(1, context);
      assert(e.isErr());
    },
  );
});
