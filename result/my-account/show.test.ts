import { show } from "./show.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
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
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return the account with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await show(context);
      assert(e.isOk());
      assertEquals(e.value.login, "jsmith");
      assertEquals(e.value.mailNotification, "only_my_events");
      assertEquals(e.value.apiKey, "sample-api-key");
      assertEquals(e.value.customFields?.[0], {
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
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await show(context);
    assert(e.isErr());
  });
});
