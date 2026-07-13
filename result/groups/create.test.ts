import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /groups.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await create(context, { name: "Developers" });
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await create(context, { name: "Developers" });
      assert(e.isErr());
    },
  );

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/groups.json`,
          async ({ request }) => {
            const body = await request.json() as { group: typeof captured };
            captured = body.group;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, {
        name: "Developers",
        userIds: [3, 5],
      });
      assert(e.isOk());
      assertEquals(captured?.name, "Developers");
      assertEquals(captured?.user_ids, [3, 5]);
    },
  );
});
