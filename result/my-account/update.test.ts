import { update } from "./update.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("PUT /my/account.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(context, { firstname: "Jane" });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, { firstname: "Jane" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await update(context, { firstname: "Jane" });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.put(
          `${context.endpoint}/my/account.json`,
          async ({ request }) => {
            const body = await request.json() as { user: typeof captured };
            captured = body.user;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await update(context, {
        firstname: "Jane",
        lastname: "Doe",
        mail: "jane@example.com",
        customFieldValues: { "1": "090-1111-2222" },
      });
      assert(e.isOk());
      assertEquals(captured?.firstname, "Jane");
      assertEquals(captured?.lastname, "Doe");
      assertEquals(captured?.mail, "jane@example.com");
      assertEquals(captured?.custom_field_values, { "1": "090-1111-2222" });
    },
  );
});
