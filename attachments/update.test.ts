import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PATCH /attachments/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 6243, { filename: "renamed.txt" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { filename: "renamed.txt" }))
        .rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { filename: "renamed.txt" })).rejects
      .toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.patch(
          `${context.endpoint}/attachments/:id.json`,
          async ({ request }) => {
            const body = await request.json() as {
              attachment: typeof captured;
            };
            captured = body.attachment;
            return HttpResponse.json({});
          },
        ),
      );
      await update(context, 6243, {
        filename: "renamed.txt",
        description: "Updated description",
      });
      expect(captured?.filename).toStrictEqual("renamed.txt");
      expect(captured?.description).toStrictEqual("Updated description");
    },
  );
});
