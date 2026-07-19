import { listTimeEntryActivities } from "./list.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /enumerations/time_entry_activities.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const activities = await listTimeEntryActivities(context);
    expect(activities).toBeDefined();
  });

  await t.step(
    "if got 200, should return time entry activities with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const activities = await listTimeEntryActivities(context);
      expect(activities.length).toStrictEqual(2);
      expect(activities[1]).toStrictEqual({
        id: 9,
        name: "Development",
        isDefault: true,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(listTimeEntryActivities(context)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    await expect(listTimeEntryActivities(context)).rejects.toThrow();
  });
});
