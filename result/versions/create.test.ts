import { create } from "./create.ts";
import { assert } from "jsr:@std/assert@1.0.18";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.12.10/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:projectId/versions.json", async (t) => {
  await t.step("if got 201, should be success", async () => {
    server.use(...validHandlers);
    const e = await create(context, 1, { name: "v1.0" });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await create(context, 422, { name: "v1.0" });
      assert(e.isErr());
    },
  );
});
