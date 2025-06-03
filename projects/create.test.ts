import { create } from "./create.ts";
import { assert } from "jsr:@std/assert@1.0.13";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.9.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects.json", async (t) => {
  await t.step(
    "if got 200, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(
        { name: "sample", identifier: "sample" },
        context,
      );
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create({ name: "sample", identifier: "sample" }, c);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/422` };
    const e = await create({ name: "sample", identifier: "sample" }, c);
    assert(e.isErr());
  });
});
