import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /issue_categories/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 3, { name: "Bugfix" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { name: "Bugfix" })).rejects
        .toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { name: "Bugfix" })).rejects.toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/issue_categories/:id.json`,
          async ({ request }) => {
            const body = await request.json() as {
              issue_category: typeof captured;
            };
            captured = body.issue_category;
            return HttpResponse.json({});
          },
        ),
      );
      await update(context, 3, {
        assignedToId: 7,
      });
      expect(captured?.assigned_to_id).toStrictEqual(7);
    },
  );
});
