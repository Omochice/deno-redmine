import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /roles/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 5);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return role with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 5);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap()).toEqual({
        id: 5,
        name: "Manager",
        assignable: true,
        issuesVisibility: "default",
        timeEntriesVisibility: "all",
        usersVisibility: "all",
        permissions: ["view_issues", "add_issues", "add_issue_notes"],
      });
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
