import { fetchList } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.18";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.10/node";

const server = setupServer();
server.listen();

Deno.test("GET /issue_statuses.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return issue statuses with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      assert(e.isOk());
      assertEquals(e.value.length, 3);
      assertEquals(e.value[0], { id: 1, name: "New", isClosed: false });
      assertEquals(e.value[2], { id: 5, name: "Closed", isClosed: true });
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
