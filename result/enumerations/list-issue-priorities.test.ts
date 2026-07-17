import { listIssuePriorities } from "./list.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /enumerations/issue_priorities.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listIssuePriorities(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return issue priorities with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await listIssuePriorities(context);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toStrictEqual(3);
      expect(e._unsafeUnwrap()[1]).toStrictEqual({
        id: 4,
        name: "Normal",
        isDefault: true,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await listIssuePriorities(context);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await listIssuePriorities(context);
    expect(e.isErr()).toBe(true);
  });
});
