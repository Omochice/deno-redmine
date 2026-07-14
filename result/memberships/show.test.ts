import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /memberships/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 5);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return a membership with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 5);
      assert(e.isOk());
      assertEquals(e.value.user, { id: 17, name: "David Robert" });
      assertEquals(e.value.roles, [
        { id: 1, name: "Manager", inherited: true },
        { id: 2, name: "Developer" },
      ]);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await show(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await show(context, 404);
    assert(e.isErr());
  });
});
