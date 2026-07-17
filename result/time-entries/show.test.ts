import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /time_entries/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 3);
    expect(e.isOk()).toBe(true);
  });

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

  await t.step("should map camelCase fields from the response", async () => {
    server.use(...validHandlers);
    const e = await show(context, 3);
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().project).toEqual({ id: 1, name: "Demo" });
    expect(e._unsafeUnwrap().issue).toEqual({ id: 5 });
    expect(e._unsafeUnwrap().activity).toEqual({ id: 9, name: "Development" });
    expect(e._unsafeUnwrap().hours).toEqual(2.5);
    expect(e._unsafeUnwrap().spentOn.toISOString().slice(0, 10)).toEqual(
      "2026-07-01",
    );
  });
});
