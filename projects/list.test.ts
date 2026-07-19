import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /projects.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const r = await fetchList(context);
    expect(r).toBeDefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      // Hit the endpoint whose /422/projects.json handler returns an error,
      // without mutating the shared context object.
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      await expect(fetchList(c)).rejects.toThrow();
    },
  );
});
