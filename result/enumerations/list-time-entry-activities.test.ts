import { listTimeEntryActivities } from "./list.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /enumerations/time_entry_activities.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listTimeEntryActivities(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return time entry activities with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await listTimeEntryActivities(context);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[1], {
        id: 9,
        name: "Development",
        isDefault: true,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await listTimeEntryActivities(context);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await listTimeEntryActivities(context);
    assert(e.isErr());
  });
});
