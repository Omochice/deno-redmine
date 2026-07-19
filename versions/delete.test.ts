import { deleteVersion } from "./delete.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("DELETE /versions/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(deleteVersion(context, 3)).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(deleteVersion(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(deleteVersion(context, 404)).rejects.toThrow();
  });
});
