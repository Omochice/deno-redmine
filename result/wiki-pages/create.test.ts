import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /project/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const r = await create(context, 1, {
      title: "create",
      text: "sample text",
    });
    expect(r.isOk()).toBe(true);
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const r = await create(context, 1, {
      title: "create",
      text: "sample text",
    });
    expect(r.isErr()).toBe(true);
  });
});
