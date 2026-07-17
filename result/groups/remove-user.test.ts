import { removeUser } from "./remove-user.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /groups/:id/users/:user_id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await removeUser(context, 20, 5);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await removeUser(context, 422, 5);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await removeUser(context, 404, 5);
    expect(e.isErr()).toBe(true);
  });
});
