import { show } from "./show.ts";
import { context, handler } from "./show.mock.ts";
import { setupServer } from "npm:msw@2.8.3/node";
import { assert } from "jsr:@std/assert@1.0.13";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'show' endpoint", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    const e = await show(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await show(2, context);
      assert(e.isErr());
    },
  );
});
