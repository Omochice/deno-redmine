import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("PUT /groups/:id.json", async (t) => {
  await t.step(
    "if got 204, should be success",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await update(context, 20, { name: "Developers" });
      expect(e.isOk()).toBe(true);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, 422, { name: "Developers" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await update(context, 404, { name: "Developers" });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.put(
          `${context.endpoint}/groups/:id.json`,
          async ({ request }) => {
            const body = await request.json() as { group: typeof captured };
            captured = body.group;
            // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
            return new HttpResponse(null, { status: 204 });
          },
        ),
      );
      const e = await update(context, 20, { userIds: [3, 5] });
      expect(e.isOk()).toBe(true);
      expect(captured?.user_ids).toEqual([3, 5]);
    },
  );
});
