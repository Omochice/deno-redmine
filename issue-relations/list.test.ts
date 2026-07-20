import { list } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /issues/:issue_id/relations.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const r = await list(context, 1);
    expect(r).toBeDefined();
  });

  await t.step(
    "if got 200, should return relations with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const relations = await list(context, 1);
      expect(relations[0]).toStrictEqual({
        id: 1,
        issueId: 1,
        issueToId: 2,
        relationType: "relates",
        delay: undefined,
      });
      expect(relations[1].relationType).toStrictEqual("precedes");
      expect(relations[1].delay).toStrictEqual(2);
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(list(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(list(context, 404)).rejects.toThrow();
  });
});
