import { deleteWiki } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validResponseHandlers);
    await expect(deleteWiki(context, 1, "sample-title")).resolves
      .toBeUndefined();
  });
  await t.step("If got 403, should throw", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    await expect(deleteWiki(context, 1, "forbidden")).rejects.toThrow();
  });
  await t.step("If got 404, should throw", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    await expect(deleteWiki(context, 1, "notfound")).rejects.toThrow();
  });
});
