import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/news.json", async (t) => {
  await t.step("if got 201, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(create(context, 1, {
      title: "New title",
      description: "New description",
    })).resolves.toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(create(context, 422, {
        title: "New title",
        description: "New description",
      })).rejects.toThrow();
    },
  );

  await t.step(
    "should send camelCase attributes as snake_case, including uploads",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/projects/:id/news.json`,
          async ({ request }) => {
            const body = await request.json() as { news: typeof captured };
            captured = body.news;
            return HttpResponse.json({});
          },
        ),
      );
      await create(context, 1, {
        title: "New title",
        description: "New description",
        summary: "New summary",
        uploads: [
          { token: "abc", filename: "note.txt", contentType: "text/plain" },
        ],
      });
      expect(captured?.title).toStrictEqual("New title");
      expect(captured?.description).toStrictEqual("New description");
      expect(captured?.summary).toStrictEqual("New summary");
      expect(captured?.uploads).toStrictEqual([
        { token: "abc", filename: "note.txt", content_type: "text/plain" },
      ]);
    },
  );
});
