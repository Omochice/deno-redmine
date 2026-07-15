import { search } from "./search.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /search.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await search(context, { q: "E2E" });
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return results with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await search(context, { q: "E2E" });
      assert(e.isOk());
      assertEquals(e.value.length, 3);
      assertEquals(e.value[0].id, 1);
      assertEquals(e.value[0].type, "issue");
      assert(e.value[0].datetime instanceof Date);
      // A null description from Redmine normalizes to undefined.
      assertEquals(e.value[2].type, "project");
      assertEquals(e.value[2].description, undefined);
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
      assert(e.isOk());
      assert(capturedUrl !== undefined);
      assertEquals(capturedUrl.searchParams.get("q"), "E2E");
      assertEquals(capturedUrl.searchParams.get("all_words"), "1");
      assertEquals(capturedUrl.searchParams.get("wiki_pages"), "1");
      assertEquals(capturedUrl.searchParams.get("scope"), "all");
      assertEquals(capturedUrl.searchParams.get("attachments"), "1");
      assertEquals(capturedUrl.searchParams.get("open_issues"), null);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await search(context, { q: "422" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await search(context, { q: "404" });
    assert(e.isErr());
  });
});
