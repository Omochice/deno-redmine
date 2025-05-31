import { deleteWiki } from "./delete.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelrs,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.8.5/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelrs);
    const r = await deleteWiki(context, 1, "sample-title");
    assert(r.isOk());
  });
  await t.step("If got 403, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const r = await deleteWiki(context, 1, "forbidden");
    assert(r.isErr());
  });
  await t.step("If got 404, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const r = await deleteWiki(context, 1, "notfound");
    assert(r.isErr());
  });
});
