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
    const group = e._unsafeUnwrap();
    expect(group.id).toStrictEqual(20);
    expect(group.name).toStrictEqual("Developers");
    expect(group.users).toBeDefined();
    expect(group.users?.[0]).toStrictEqual({ id: 5, name: "John Smith" });
    expect(group.memberships?.[0].project).toStrictEqual({
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
