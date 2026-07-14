import { fetchList } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /queries.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return queries with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      assert(e.isOk());
      assertEquals(e.value.length, 3);
      assertEquals(e.value[0], {
        id: 1,
        name: "All issues",
        isPublic: true,
        projectId: 1,
      });
      assertEquals(e.value[1], {
        id: 2,
        name: "Open issues",
        isPublic: true,
        projectId: undefined,
      });
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
