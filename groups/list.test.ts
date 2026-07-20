import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /groups.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const r = await Array.fromAsync(list(context));
    expect(r).toBeDefined();
  });

  await t.step(
    "if got 200, should return groups as id/name pairs",
    async () => {
      server.resetHandlers(...validHandlers);
      const groups = await Array.fromAsync(list(context));
      expect(groups.length).toStrictEqual(2);
      expect(groups[0]).toStrictEqual({ id: 53, name: "Managers" });
      expect(groups[1]).toStrictEqual({
        id: 55,
        name: "Developers",
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(Array.fromAsync(list(context))).rejects.toThrow();
    },
  );
});
