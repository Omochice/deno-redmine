import { fetchList } from "./list.ts";
import { assert } from "jsr:@std/assert@1.0.16";

import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.3/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/index.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await fetchList(context, 1);
    assert(e.isOk());
    assert(e.value.length === 2);
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const e = await fetchList(context, 2);
    assert(e.isErr());
    assert(e.error.message === "Unprocessable Entity");
  });
});
