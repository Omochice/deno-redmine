import { deleteAttachment } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /attachments/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await deleteAttachment(context, 6243);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await deleteAttachment(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await deleteAttachment(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
