import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/index.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await fetchList(context, 1);
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().length).toBe(2);
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const e = await fetchList(context, 2);
    expect(e.isErr()).toBe(true);
    expect(e._unsafeUnwrapErr().message).toBe("Unprocessable Entity");
  });
});
