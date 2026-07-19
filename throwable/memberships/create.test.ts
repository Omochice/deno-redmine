import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/memberships.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(create(context, 1, { userId: 17, roleIds: [1] })).resolves
        .toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(create(context, 422, { userId: 17, roleIds: [1] })).rejects
        .toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(create(context, 404, { userId: 17, roleIds: [1] })).rejects
      .toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/projects/:id/memberships.json`,
          async ({ request }) => {
            const body = await request.json() as {
              membership: typeof captured;
            };
            captured = body.membership;
            return HttpResponse.json({});
          },
        ),
      );
      await create(context, 1, {
        userId: 17,
        roleIds: [1, 2],
      });
      expect(captured?.user_id).toStrictEqual(17);
      expect(captured?.role_ids).toStrictEqual([1, 2]);
    },
  );
});
