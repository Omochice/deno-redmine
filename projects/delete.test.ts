import { deleteProject } from "./delete.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import { context, handler } from "./delete.mock.ts";
import { setupServer } from "npm:msw@2.8.7/node";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'delete' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    const e = await deleteProject(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await deleteProject(2, context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await deleteProject(3, context);
    assert(e.isErr());
  });
});
