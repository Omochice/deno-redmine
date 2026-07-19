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
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const priorities = await listIssuePriorities(context);
    expect(priorities).toBeDefined();
  });

  await t.step(
    "if got 200, should return issue priorities with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const priorities = await listIssuePriorities(context);
      expect(priorities.length).toStrictEqual(3);
      expect(priorities[1]).toStrictEqual({
        id: 4,
        name: "Normal",
        isDefault: true,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(listIssuePriorities(context)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    await expect(listIssuePriorities(context)).rejects.toThrow();
  });
});
