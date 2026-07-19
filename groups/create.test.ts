import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /groups.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.resetHandlers(...validHandlers);
      await expect(create(context, { name: "Developers" })).resolves
        .toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(create(context, { name: "Developers" })).rejects
        .toThrow();
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
      await create(context, {
        name: "Developers",
        userIds: [3, 5],
      });
      expect(captured?.name).toStrictEqual("Developers");
      expect(captured?.user_ids).toStrictEqual([3, 5]);
    },
  );
});
