import { show } from "./show.ts";
import { assert } from "jsr:@std/assert@1.0.15";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.11.6/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/issues/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.resetHandlers(...validHandlers);
    const e = await show(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await show(context, 1);
      assert(e.isErr());
    },
  );
});
