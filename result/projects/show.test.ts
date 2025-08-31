import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.11.1/node";
import { assert } from "jsr:@std/assert@1.0.14";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await show(context, 422);
      assert(e.isErr());
    },
  );
});
