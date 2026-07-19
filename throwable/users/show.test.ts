import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /users/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const user = await show(context, 2);
    expect(user).toBeDefined();
  });

  await t.step(
    "if got 200, should return a user with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const user = await show(context, 2);
      expect(user.id).toStrictEqual(2);
      expect(user.login).toStrictEqual("jsmith");
      expect(user.lastLoginOn).toStrictEqual(
        new Date("2026-07-13T00:00:00.000Z"),
      );
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(show(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(show(context, 404)).rejects.toThrow();
  });
});
