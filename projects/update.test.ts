import { update } from "./update.ts";
import { context, handler } from "./update.mock.ts";
import { setupServer } from "npm:msw@2.8.6/node";
import { assert } from "jsr:@std/assert@1.0.13";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'update' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    const e = await update(1, { name: "sample" }, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await update(2, { name: "sample" }, context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await update(3, { name: "sample" }, context);
    assert(e.isErr());
  });
});
