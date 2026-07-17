import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /issue_statuses.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return issue statuses with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toEqual(3);
      expect(e._unsafeUnwrap()[0]).toEqual({
        id: 1,
        name: "New",
        isClosed: false,
      });
      expect(e._unsafeUnwrap()[2]).toEqual({
        id: 5,
        name: "Closed",
        isClosed: true,
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
