import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandlers,
  wikiPage,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validResponseHandlers);
    const wiki = await show(context, { projectId: 1, title: "sample-title" });
    expect(wiki.title).toBe("sample-title");
  });
  await t.step("if got 200 with null comments, should resolve", async () => {
    server.resetHandlers(
      http.get(
        `${context.endpoint}/projects/:id/wiki/:page.json`,
        ({ params }) => {
          return HttpResponse.json({
            wiki_page: wikiPage({
              title: String(params.page),
              version: 1,
              text: "# page content",
              author: { id: 1, name: "Admin" },
              comments: null,
            }),
          });
        },
      ),
    );
    const wiki = await show(context, { projectId: 1, title: "sample-title" });
    expect(wiki.title).toStrictEqual("sample-title");
    expect(wiki.comments).toBeUndefined();
  });
  await t.step(
    "should request the attachments include and parse them",
    async () => {
      let capturedInclude: string | null = null;
      server.resetHandlers(
        http.get(
          `${context.endpoint}/projects/:id/wiki/:page.json`,
          ({ request, params }) => {
            capturedInclude = new URL(request.url).searchParams.get("include");
            return HttpResponse.json({
              wiki_page: wikiPage({
                title: String(params.page),
                version: 1,
                text: "# page content",
                author: { id: 1, name: "Admin" },
                comments: null,
                attachments: [{ id: 7, filename: "note.txt" }],
              }),
            });
          },
        ),
      );
      const wiki = await show(context, {
        projectId: 1,
        title: "sample-title",
        includes: ["attachments"],
      });
      expect(capturedInclude).toStrictEqual("attachments");
      expect(wiki.attachments).toStrictEqual([
        { id: 7, filename: "note.txt" },
      ]);
    },
  );
  await t.step("If got 422, should throw", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    await expect(
      show(context, { projectId: 2, title: "sample-title" }),
    ).rejects.toThrow("Unprocessable Entity");
  });
});

Deno.test("GET /projects/:id/wiki/:page/:version.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validResponseHandlers);
    const wiki = await show(context, {
      projectId: 1,
      title: "sample-title",
      version: 3,
    });
    expect(wiki.title).toBe("sample-title");
    expect(wiki.version).toBe(3);
  });
});
