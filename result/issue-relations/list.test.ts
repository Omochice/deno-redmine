import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /issues/:issue_id/relations.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return relations with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context, 1);
      assert(e.isOk());
      assertEquals(e.value[0], {
        id: 1,
        issueId: 1,
        issueToId: 2,
        relationType: "relates",
        delay: undefined,
      });
      assertEquals(e.value[1].relationType, "precedes");
      assertEquals(e.value[1].delay, 2);
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
