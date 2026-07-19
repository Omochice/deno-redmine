import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/issue_categories.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(create(context, 1, { name: "Bug" })).resolves
        .toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(create(context, 422, { name: "Bug" })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(create(context, 404, { name: "Bug" })).rejects.toThrow();
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
      await create(context, 1, {
        name: "Bug",
        assignedToId: 5,
      });
      expect(captured?.name).toStrictEqual("Bug");
      expect(captured?.assigned_to_id).toStrictEqual(5);
    },
  );
});
