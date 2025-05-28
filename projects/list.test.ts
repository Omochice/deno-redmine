import { fetchList } from "./list.ts";
import { contexts, handler } from "./list.mock.ts";
import { setupServer } from "npm:msw@2.8.5/node";
import { assert } from "jsr:@std/assert@1.0.13";

const server = setupServer(...handler);
server.listen();

Deno.test("test for redmine project 'list' endpoint", async (t) => {
  await t.step("if got 200, should be success", async () => {
    const e = await fetchList(contexts[0]);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await fetchList(contexts[1]);
      assert(e.isErr());
    },
  );
});
