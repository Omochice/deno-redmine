import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /news.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return news with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toEqual(2);
      expect(e._unsafeUnwrap()[0]).toEqual({
        id: 1,
        project: { id: 1, name: "Demo" },
        author: { id: 2, name: "John Smith" },
        title: "News title",
        summary: "News summary",
        description: "News description",
        createdOn: new Date("2026-07-13T00:00:00.000Z"),
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
