import { show } from "./show.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.9.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title");
    assert(e.isOk());
    assert(e.value.title === "sample-title");
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const e = await show(context, 2, "sample-title");
    assert(e.isErr());
    assert(e.error.message === "Unprocessable Entity");
  });
});

Deno.test("GET /projects/:id/wiki/:page/:version.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title", 3);
    assert(e.isOk());
    assert(e.value.title === "sample-title");
    assert(e.value.version === 3);
  });
});
