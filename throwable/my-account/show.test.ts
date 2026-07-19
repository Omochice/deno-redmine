import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /my/account.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const account = await show(context);
    expect(account).toBeDefined();
  });

  await t.step(
    "if got 200, should return the account with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const account = await show(context);
      expect(account.login).toStrictEqual("jsmith");
      expect(account.mailNotification).toStrictEqual(
        "only_my_events",
      );
      expect(account.apiKey).toStrictEqual("sample-api-key");
      expect(account.customFields?.[0]).toStrictEqual({
        id: 1,
        name: "Phone",
        value: "090-0000-0000",
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(show(context)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    await expect(show(context)).rejects.toThrow();
  });
});
