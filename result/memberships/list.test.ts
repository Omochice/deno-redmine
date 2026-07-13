import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/memberships.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return memberships with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context, 1);
      assert(e.isOk());
      assertEquals(e.value[0].user, { id: 17, name: "David Robert" });
      assertEquals(e.value[0].roles, [
        { id: 1, name: "Manager", inherited: true },
        { id: 2, name: "Developer" },
      ]);
      assertEquals(e.value[1].group, { id: 8, name: "Developers" });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await fetchList(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await fetchList(context, 404);
    assert(e.isErr());
  });
});
