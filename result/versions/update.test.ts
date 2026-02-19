import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.10/node";
import { assert } from "jsr:@std/assert@1.0.18";

const server = setupServer();
server.listen();

Deno.test("PUT /versions/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 1, { name: "v1.1" });
    assert(e.isOk());
  });

  await t.step("if got 204 with optional fields, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 1, {
      name: "v1.1",
      status: "locked",
      dueDate: "2025-06-30",
      wikiPageTitle: "Release_v1.1",
      description: "updated description",
    });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { name: "v1.1" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { name: "v1.1" });
    assert(e.isErr());
  });
});
