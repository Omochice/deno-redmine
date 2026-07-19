import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /users/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 2, { firstname: "Jonathan" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { firstname: "Jonathan" })).rejects
        .toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { firstname: "Jonathan" })).rejects
      .toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/users/:id.json`,
          async ({ request }) => {
            const body = await request.json() as { user: typeof captured };
            captured = body.user;
            return HttpResponse.json({});
          },
        ),
      );
      await update(context, 2, {
        mailNotification: "none",
        admin: true,
      });
      expect(captured?.mail_notification).toStrictEqual("none");
      expect(captured?.admin).toStrictEqual(true);
    },
  );
});
