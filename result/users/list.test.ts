import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /users.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return users with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context);
      expect(e.isOk()).toBe(true);
      const users = e._unsafeUnwrap();
      expect(users.length).toStrictEqual(2);
      expect(users[1].login).toStrictEqual("admin");
      expect(users[1].admin).toStrictEqual(true);
      expect(users[1].apiKey).toStrictEqual("abcdef1234567890");
      expect(users[0].lastLoginOn).toStrictEqual(
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
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await fetchList(c);
    expect(e.isErr()).toBe(true);
  });
});
