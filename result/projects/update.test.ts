import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.3/node";
import { assert } from "jsr:@std/assert@1.0.16";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 1, { name: "sample" });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { name: "sample" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { name: "sample" });
    assert(e.isErr());
  });
});
