import { search } from "./search.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /search.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await search(context, { q: "E2E" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return results with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await search(context, { q: "E2E" });
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toEqual(3);
      expect(e._unsafeUnwrap()[0].id).toEqual(1);
      expect(e._unsafeUnwrap()[0].type).toEqual("issue");
      expect(e._unsafeUnwrap()[0].datetime instanceof Date).toBe(true);
      // A null description from Redmine normalizes to undefined.
      expect(e._unsafeUnwrap()[2].type).toEqual("project");
      expect(e._unsafeUnwrap()[2].description).toEqual(undefined);
    },
  );

  await t.step(
    "should serialize camelCase query flags to snake_case params",
    async () => {
      let capturedUrl: URL | undefined;
      server.resetHandlers(
        http.get(`${context.endpoint}/search.json`, ({ request }) => {
          capturedUrl = new URL(request.url);
          return HttpResponse.json({
            results: [],
            total_count: 0,
            offset: 0,
            limit: 25,
          });
        }),
      );
      const e = await search(context, {
        q: "E2E",
        allWords: true,
        wikiPages: true,
        openIssues: false,
        scope: "all",
        attachments: true,
      });
      expect(e.isOk()).toBe(true);
      expect(capturedUrl !== undefined).toBe(true);
      expect(capturedUrl!.searchParams.get("q")).toEqual("E2E");
      expect(capturedUrl!.searchParams.get("all_words")).toEqual("1");
      expect(capturedUrl!.searchParams.get("wiki_pages")).toEqual("1");
      expect(capturedUrl!.searchParams.get("scope")).toEqual("all");
      expect(capturedUrl!.searchParams.get("attachments")).toEqual("1");
      expect(capturedUrl!.searchParams.get("open_issues")).toEqual(null);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await search(context, { q: "422" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await search(context, { q: "404" });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should fetch every page when results span multiple pages",
    async () => {
      const total = 30;
      const all = Array.from({ length: total }, (_, i) => ({
        id: i + 1,
        title: `Result ${i + 1}`,
        type: "issue",
        url: `http://redmine.example.com/issues/${i + 1}`,
        description: "d",
        datetime: "2026-07-13T00:00:00.000Z",
      }));
      server.resetHandlers(
        http.get(`${context.endpoint}/search.json`, ({ request }) => {
          const params = new URL(request.url).searchParams;
          const offset = Number(params.get("offset"));
          const limit = Number(params.get("limit"));
          return HttpResponse.json({
            results: all.slice(offset, offset + limit),
            total_count: total,
            offset,
            limit,
          });
        }),
      );
      const e = await search(context, { q: "E2E" });
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toEqual(total);
      expect(e._unsafeUnwrap()[0].id).toEqual(1);
      expect(e._unsafeUnwrap()[total - 1].id).toEqual(total);
    },
  );
});
