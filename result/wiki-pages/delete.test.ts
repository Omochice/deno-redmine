import { deleteWiki } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const r = await deleteWiki(context, 1, "sample-title");
    expect(r.isOk()).toBe(true);
  });
  await t.step("If got 403, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const r = await deleteWiki(context, 1, "forbidden");
    expect(r.isErr()).toBe(true);
  });
  await t.step("If got 404, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const r = await deleteWiki(context, 1, "notfound");
    expect(r.isErr()).toBe(true);
  });
});
