import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /users.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return users with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[1].login, "admin");
      assertEquals(e.value[1].admin, true);
      assertEquals(e.value[1].apiKey, "abcdef1234567890");
      assertEquals(
        e.value[0].lastLoginOn,
        new Date("2026-07-13T00:00:00.000Z"),
      );
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await fetchList(c);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await fetchList(c);
    assert(e.isErr());
  });
});
