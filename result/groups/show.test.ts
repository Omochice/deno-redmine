import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /groups/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.resetHandlers(...validHandlers);
    const e = await show(context, 20);
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().id).toEqual(20);
    expect(e._unsafeUnwrap().name).toEqual("Developers");
    expect(e._unsafeUnwrap().users !== undefined).toBe(true);
    expect(e._unsafeUnwrap().users?.[0]).toEqual({ id: 5, name: "John Smith" });
    expect(e._unsafeUnwrap().memberships?.[0].project).toEqual({
      id: 1,
      name: "Demo",
    });
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await show(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await show(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
