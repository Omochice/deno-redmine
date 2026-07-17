import { update } from "./update.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /my/account.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(context, { firstname: "Jane" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, { firstname: "Jane" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await update(context, { firstname: "Jane" });
    expect(e.isErr()).toBe(true);
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
      expect(e.isOk()).toBe(true);
      expect(captured?.firstname).toStrictEqual("Jane");
      expect(captured?.lastname).toStrictEqual("Doe");
      expect(captured?.mail).toStrictEqual("jane@example.com");
      expect(captured?.custom_field_values).toStrictEqual({
        "1": "090-1111-2222",
      });
    },
  );
});
