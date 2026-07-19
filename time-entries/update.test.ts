import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /time_entries/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 3, { hours: 3 })).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { hours: 3 })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { hours: 3 })).rejects.toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/time_entries/:id.json`,
          async ({ request }) => {
            const body = await request.json() as {
              time_entry: typeof captured;
            };
            captured = body.time_entry;
            return HttpResponse.json({});
          },
        ),
      );
      await update(context, 3, {
        activityId: 8,
        spentOn: new Date("2026-07-02"),
      });
      expect(captured?.activity_id).toStrictEqual(8);
      expect(captured?.spent_on).toStrictEqual("2026-07-02");
    },
  );
});
