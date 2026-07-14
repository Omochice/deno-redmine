import { deleteGroup } from "./delete.ts";
import { assert } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /groups/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await deleteGroup(context, 20);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await deleteGroup(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await deleteGroup(context, 404);
    assert(e.isErr());
  });
});
