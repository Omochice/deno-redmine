import { create } from "./create.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import { contexts, handler } from "./create.mock.ts";
import { setupServer } from "npm:msw@2.8.5/node";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'create' endpoint", async (t) => {
  await t.step(
    "if got 200, should be success",
    async () => {
      const e = await create(
        { name: "sample", identifier: "sample" },
        contexts[0],
      );
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await create(
        { name: "sample", identifier: "sample" },
        contexts[1],
      );
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await create(
      { name: "sample", identifier: "sample" },
      contexts[2],
    );
    assert(e.isErr());
  });
});
