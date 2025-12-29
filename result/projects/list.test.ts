import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.6/node";
import { assert } from "jsr:@std/assert@1.0.16";

const server = setupServer();
server.listen();

Deno.test("GET /projects.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      // Simulate an endpoint that returns an error
      context.endpoint += "/422";
      const e = await fetchList(context);
      assert(e.isErr());
    },
  );
});
