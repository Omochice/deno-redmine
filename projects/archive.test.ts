import { archive, unarchive } from "./archive.ts";
import { assert } from "jsr:@std/assert@1.0.13";

import { context, handler } from "./archive.mock.ts";
import { setupServer } from "npm:msw@2.8.3/node";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'archive' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    const e = await archive(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await archive(2, context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await archive(3, context);
    assert(e.isErr());
  });
});

Deno.test("test for redmine project 'unarchive' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    const e = await unarchive(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await unarchive(2, context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await unarchive(3, context);
    assert(e.isErr());
  });
});
