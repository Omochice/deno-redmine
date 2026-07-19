import { deleteNews } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /news/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(deleteNews(context, 1)).resolves.toBeUndefined();
  });

  await t.step("if got 404, should throw", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(deleteNews(context, 404)).rejects.toThrow();
  });
});
