import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("PUT /memberships/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 5, { roleIds: [2] });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { roleIds: [2] });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { roleIds: [2] });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/memberships/:id.json`,
          async ({ request }) => {
            const body = await request.json() as {
              membership: typeof captured;
            };
            captured = body.membership;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await update(context, 5, {
        roleIds: [3, 4],
      });
      assert(e.isOk());
      assertEquals(captured?.role_ids, [3, 4]);
    },
  );
});
