import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import {
  context,
  invalidResponseHandlers,
  validResponseHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/index.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validResponseHandlers);
    const wikis = await Array.fromAsync(list(context, 1));
    expect(wikis.length).toBe(2);
  });
  await t.step("If got 422, should throw", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    await expect(Array.fromAsync(list(context, 2))).rejects.toThrow(
      "Unprocessable Entity",
    );
  });
});
