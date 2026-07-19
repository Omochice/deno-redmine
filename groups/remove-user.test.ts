import { removeUser } from "./remove-user.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /groups/:id/users/:user_id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(removeUser(context, 20, 5)).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(removeUser(context, 422, 5)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(removeUser(context, 404, 5)).rejects.toThrow();
  });
});
