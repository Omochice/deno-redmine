import { deleteVersion } from "./delete.ts";
import { assert } from "jsr:@std/assert@1.0.18";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.10/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /versions/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await deleteVersion(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await deleteVersion(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await deleteVersion(context, 404);
    assert(e.isErr());
  });
});
