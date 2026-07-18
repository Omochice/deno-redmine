import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("PUT /news/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 1, { title: "Updated title" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { title: "Updated title" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("should send camelCase attributes as snake_case", async () => {
    let captured: Record<string, unknown> | undefined;
    server.use(
      http.put(
        `${context.endpoint}/news/:id.json`,
        async ({ request }) => {
          const body = await request.json() as { news: typeof captured };
          captured = body.news;
          return HttpResponse.json({});
        },
      ),
    );
    const e = await update(context, 1, {
      title: "Updated title",
      uploads: [{ token: "xyz", contentType: "image/png" }],
    });
    expect(e.isOk()).toBe(true);
    expect(captured?.title).toStrictEqual("Updated title");
    expect(captured?.uploads).toStrictEqual([
      { token: "xyz", content_type: "image/png" },
    ]);
  });
});
