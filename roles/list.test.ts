import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /roles.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const roles = await list(context);
    expect(roles).toBeDefined();
  });

  await t.step(
    "if got 200, should return roles with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const roles = await list(context);
      expect(roles.length).toStrictEqual(2);
      expect(roles[0]).toStrictEqual({ id: 1, name: "Manager" });
      expect(roles[1]).toStrictEqual({ id: 2, name: "Developer" });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(list(context)).rejects.toThrow();
    },
  );
});
