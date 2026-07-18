import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/issue_categories.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(context, 1, { name: "Bug" });
      expect(e.isOk()).toBe(true);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await create(context, 422, { name: "Bug" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await create(context, 404, { name: "Bug" });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/projects/:id/issue_categories.json`,
          async ({ request }) => {
            const body = await request.json() as {
              issue_category: typeof captured;
            };
            captured = body.issue_category;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, 1, {
        name: "Bug",
        assignedToId: 5,
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.name).toStrictEqual("Bug");
      expect(captured?.assigned_to_id).toStrictEqual(5);
    },
  );
});
