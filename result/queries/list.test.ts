import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /queries.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return queries with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      expect(e.isOk()).toBe(true);
      const queries = e._unsafeUnwrap();
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
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context);
      expect(e.isErr()).toBe(true);
    },
  );
});
