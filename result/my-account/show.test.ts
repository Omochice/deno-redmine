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
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await show(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return the account with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await show(context);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().login).toEqual("jsmith");
      expect(e._unsafeUnwrap().mailNotification).toEqual("only_my_events");
      expect(e._unsafeUnwrap().apiKey).toEqual("sample-api-key");
      expect(e._unsafeUnwrap().customFields?.[0]).toEqual({
        id: 1,
        name: "Phone",
        value: "090-0000-0000",
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await show(context);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await show(context);
    expect(e.isErr()).toBe(true);
  });
});
