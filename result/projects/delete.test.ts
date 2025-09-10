import { deleteProject } from "./delete.ts";
import { assert } from "jsr:@std/assert@1.0.14";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.11.2/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /projects/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await deleteProject(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await deleteProject(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await deleteProject(context, 404);
    assert(e.isErr());
  });
});
