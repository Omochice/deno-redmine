import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("PUT /news/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(update(context, 1, { title: "Updated title" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(update(context, 422, { title: "Updated title" })).rejects
        .toThrow();
    },
  );

  await t.step("should send camelCase attributes as snake_case", async () => {
    let captured: Record<string, unknown> | undefined;
    server.resetHandlers(
      http.put(
        `${context.endpoint}/news/:id.json`,
        async ({ request }) => {
          const body = await request.json() as { news: typeof captured };
          captured = body.news;
          return HttpResponse.json({});
        },
      ),
    );
    await update(context, 1, {
      title: "Updated title",
      uploads: [{ token: "xyz", contentType: "image/png" }],
    });
    expect(captured?.title).toStrictEqual("Updated title");
    expect(captured?.uploads).toStrictEqual([
      { token: "xyz", content_type: "image/png" },
    ]);
  });
});
