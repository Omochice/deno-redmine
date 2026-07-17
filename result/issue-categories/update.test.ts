import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /issue_categories/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 3, { name: "Bugfix" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { name: "Bugfix" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { name: "Bugfix" });
    expect(e.isErr()).toBe(true);
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
      const e = await update(context, 3, {
        assignedToId: 7,
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.assigned_to_id).toEqual(7);
    },
  );
});
