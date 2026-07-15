import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("PATCH /attachments/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 6243, { filename: "renamed.txt" });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { filename: "renamed.txt" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { filename: "renamed.txt" });
    assert(e.isErr());
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
      const e = await update(context, 6243, {
        filename: "renamed.txt",
        description: "Updated description",
      });
      assert(e.isOk());
      assertEquals(captured?.filename, "renamed.txt");
      assertEquals(captured?.description, "Updated description");
    },
  );
});
