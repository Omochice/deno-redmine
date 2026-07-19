import { addUser } from "./add-user.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /groups/:id/users.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(addUser(context, 20, 5)).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(addUser(context, 422, 5)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(addUser(context, 404, 5)).rejects.toThrow();
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
    await addUser(context, 20, 5);
    expect(captured?.user_id).toStrictEqual(5);
  });
});
