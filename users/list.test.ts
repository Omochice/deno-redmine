import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /users.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const users = await fetchList(context);
    expect(users).toBeDefined();
  });

  await t.step(
    "if got 200, should return users with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const users = await fetchList(context);
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
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      await expect(fetchList(c)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    await expect(fetchList(c)).rejects.toThrow();
  });
});
