import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /users/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 2);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return a user with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 2);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().id).toEqual(2);
      expect(e._unsafeUnwrap().login).toEqual("jsmith");
      expect(e._unsafeUnwrap().lastLoginOn).toEqual(
        new Date("2026-07-13T00:00:00.000Z"),
      );
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await show(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await show(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
