import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /time_entries/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 3);
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

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await show(context, 404);
    assert(e.isErr());
  });

  await t.step("should map camelCase fields from the response", async () => {
    server.use(...validHandlers);
    const e = await show(context, 3);
    assert(e.isOk());
    assertEquals(e.value.project, { id: 1, name: "Demo" });
    assertEquals(e.value.issue, { id: 5 });
    assertEquals(e.value.activity, { id: 9, name: "Development" });
    assertEquals(e.value.hours, 2.5);
    assertEquals(e.value.spentOn.toISOString().slice(0, 10), "2026-07-01");
  });
});
