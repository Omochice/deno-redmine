import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /issues/:issue_id/relations.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context, 1);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return relations with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context, 1);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap()[0]).toEqual({
        id: 1,
        issueId: 1,
        issueToId: 2,
        relationType: "relates",
        delay: undefined,
      });
      expect(e._unsafeUnwrap()[1].relationType).toEqual("precedes");
      expect(e._unsafeUnwrap()[1].delay).toEqual(2);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await fetchList(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await fetchList(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
