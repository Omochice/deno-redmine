import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /issue_statuses.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const issueStatuses = await list(context);
    expect(issueStatuses).toBeDefined();
  });

  await t.step(
    "if got 200, should return issue statuses with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const issueStatuses = await list(context);
      expect(issueStatuses.length).toStrictEqual(3);
      expect(issueStatuses[0]).toStrictEqual({
        id: 1,
        name: "New",
        isClosed: false,
      });
      expect(issueStatuses[2]).toStrictEqual({
        id: 5,
        name: "Closed",
        isClosed: true,
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
