import { deleteNews } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /news/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await deleteNews(context, 1);
    expect(e.isOk()).toBe(true);
  });

  await t.step("if got 404, should be err", async () => {
    server.use(...invalidHandlers);
    const e = await deleteNews(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
