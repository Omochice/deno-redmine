import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/issues/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.resetHandlers(...validHandlers);
    const e = await show(context, 1);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await show(context, 1);
      expect(e.isErr()).toBe(true);
    },
  );
});
