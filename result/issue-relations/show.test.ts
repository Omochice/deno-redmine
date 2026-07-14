import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /relations/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return a relation with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 1);
      assert(e.isOk());
      assertEquals(e.value.issueToId, 2);
      assertEquals(e.value.relationType, "relates");
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
