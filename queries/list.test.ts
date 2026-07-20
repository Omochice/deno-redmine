import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /queries.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const queries = await list(context);
    expect(queries).toBeDefined();
  });

  await t.step(
    "if got 200, should return queries with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const queries = await list(context);
      expect(queries.length).toStrictEqual(3);
      expect(queries[0]).toStrictEqual({
        id: 1,
        name: "All issues",
        isPublic: true,
        projectId: 1,
      });
      expect(queries[1]).toStrictEqual({
        id: 2,
        name: "Open issues",
        isPublic: true,
        projectId: undefined,
      });
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
