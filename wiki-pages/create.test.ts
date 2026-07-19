import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandlers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /project/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validResponseHandlers);
    await expect(create(context, 1, {
      title: "create",
      text: "sample text",
    })).resolves.toBeUndefined();
  });
  await t.step("If got 422, should throw", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    await expect(create(context, 1, {
      title: "create",
      text: "sample text",
    })).rejects.toThrow();
  });

  await t.step("should send uploads as snake_case tokens", async () => {
    let captured: { uploads?: unknown } | undefined;
    server.resetHandlers(
      http.put(
        `${context.endpoint}/projects/:id/wiki/:page.json`,
        async ({ request }) => {
          const body = await request.json() as { wiki_page: typeof captured };
          captured = body.wiki_page;
          return HttpResponse.json({});
        },
      ),
    );
    await create(context, 1, {
      title: "create",
      text: "sample text",
      uploads: [
        { token: "abc", filename: "note.txt", contentType: "text/plain" },
      ],
    });
    expect(captured?.uploads).toStrictEqual([
      { token: "abc", filename: "note.txt", content_type: "text/plain" },
    ]);
  });
});
