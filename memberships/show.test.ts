import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /memberships/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const membership = await show(context, 5);
    expect(membership).toBeDefined();
  });

  await t.step(
    "if got 200, should return a membership with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const membership = await show(context, 5);
      expect(membership.user).toStrictEqual({
        id: 17,
        name: "David Robert",
      });
      expect(membership.roles).toStrictEqual([
        { id: 1, name: "Manager", inherited: true },
        { id: 2, name: "Developer" },
      ]);
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
