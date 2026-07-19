import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /relations/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const r = await show(context, 1);
    expect(r).toBeDefined();
  });

  await t.step(
    "if got 200, should return a relation with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const relation = await show(context, 1);
      expect(relation.issueToId).toStrictEqual(2);
      expect(relation.relationType).toStrictEqual("relates");
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
