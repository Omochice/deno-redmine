import { list } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/issue_categories.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const r = await Array.fromAsync(list(context, 1));
    expect(r).toBeDefined();
  });

  await t.step(
    "if got 200, should return issue categories with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const categories = await Array.fromAsync(list(context, 1));
      expect(categories[0].assignedTo).toStrictEqual({
        id: 5,
        name: "Alice",
      });
      expect(categories[1].assignedTo).toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(Array.fromAsync(list(context, 422))).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(Array.fromAsync(list(context, 404))).rejects.toThrow();
  });
});
