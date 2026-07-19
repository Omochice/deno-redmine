import { archive, unarchive } from "./archive.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/:id/archive.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    await expect(archive(context, 1)).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(archive(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(archive(context, 404)).rejects.toThrow();
  });
});

Deno.test("PUT /projects/:id/unarchive.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    await expect(unarchive(context, 1)).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(unarchive(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(unarchive(context, 404)).rejects.toThrow();
  });
});
