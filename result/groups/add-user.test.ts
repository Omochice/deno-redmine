import { addUser } from "./add-user.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /groups/:id/users.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await addUser(context, 20, 5);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await addUser(context, 422, 5);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await addUser(context, 404, 5);
    expect(e.isErr()).toBe(true);
  });

  await t.step("should send the user id as user_id", async () => {
    let captured: Record<string, unknown> | undefined;
    server.resetHandlers(
      http.post(
        `${context.endpoint}/groups/:id/users.json`,
        async ({ request }) => {
          captured = await request.json() as Record<string, unknown>;
          // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );
    const e = await addUser(context, 20, 5);
    expect(e.isOk()).toBe(true);
    expect(captured?.user_id).toStrictEqual(5);
  });
});
