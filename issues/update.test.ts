import { update } from "./update.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.9.0/node";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/issues/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(1, { notes: "sample" }, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(411, { notes: "sample" }, context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await update(404, { notes: "sample" }, context);
    assert(e.isErr());
  });
});
