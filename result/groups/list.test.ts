import { fetchList } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /groups.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return groups as id/name pairs",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[0], { id: 53, name: "Managers" });
      assertEquals(e.value[1], { id: 55, name: "Developers" });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context);
      assert(e.isErr());
    },
  );
});
