import { show } from "./show.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /groups/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.resetHandlers(...validHandlers);
    const e = await show(context, 20);
    assert(e.isOk());
    assertEquals(e.value.id, 20);
    assertEquals(e.value.name, "Developers");
    assert(e.value.users !== undefined);
    assertEquals(e.value.users?.[0], { id: 5, name: "John Smith" });
    assertEquals(e.value.memberships?.[0].project, { id: 1, name: "Demo" });
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await show(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await show(context, 404);
    assert(e.isErr());
  });
});
