import { listIssues } from "./list.ts";
import { assert } from "jsr:@std/assert@1.0.15";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.2/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/issues.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listIssues(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await listIssues(context);
      assert(e.isErr());
    },
  );
});
