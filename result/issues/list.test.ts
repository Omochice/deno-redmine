import { listIssues } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/issues.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listIssues(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await listIssues(context);
      assert(e.isErr());
    },
  );
});

function sampleIssue(id: number): Record<string, unknown> {
  return {
    id,
    project: { id: 1, name: "hi" },
    tracker: { id: 1, name: "issue" },
    status: { id: 1, name: "open", is_closed: false },
    priority: { id: 1, name: "normal" },
    author: { id: 1, name: "sample user" },
    assigned_to: undefined,
    category: undefined,
    subject: `issue-${id}`,
    description: "",
    start_date: "2023-10-09T00:00:00Z",
    due_date: null,
    done_ratio: 0,
    is_private: false,
    estimated_hours: null,
    total_estimated_hours: 0,
    spent_hours: 0,
    total_spent_hours: 0,
    created_on: "2023-10-09T12:17:17Z",
    updated_on: "2023-10-09T12:17:17Z",
    closed_on: null,
    custom_fields: undefined,
  };
}

type RecordedRequest = { limit: string | null; offset: string | null };

function pagingHandler(
  totalAvailable: number,
  requests: RecordedRequest[],
) {
  const allIssues = Array.from(
    { length: totalAvailable },
    (_, i) => sampleIssue(i + 1),
  );
  return http.get(`${context.endpoint}/issues.json`, ({ request }) => {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get("limit");
    const offsetParam = url.searchParams.get("offset");
    requests.push({ limit: limitParam, offset: offsetParam });
    const limit = Number(limitParam);
    const offset = Number(offsetParam);
    const page = allIssues.slice(offset, offset + limit);
    return HttpResponse.json({
      issues: page,
      total_count: allIssues.length,
      offset,
      limit,
    });
  });
}

Deno.test("listIssues limit option", async (t) => {
  await t.step(
    "returns at most `limit` issues with a single page request when limit <= page size",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      const e = await listIssues(context, { limit: 1 });

      assert(e.isOk());
      assertEquals(e.value.length, 1);
      assertEquals(requests.length, 1);
      assertEquals(requests[0], { limit: "1", offset: "0" });
    },
  );

  await t.step(
    "fetches only as many pages as needed to satisfy a limit spanning multiple pages",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(300, requests));

      const e = await listIssues(context, { limit: 150 });

      assert(e.isOk());
      assertEquals(e.value.length, 150);
      assertEquals(requests, [
        { limit: "100", offset: "0" },
        { limit: "50", offset: "100" },
      ]);
    },
  );

  await t.step(
    "without a limit, still paginates over the full total and returns every issue",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(150, requests));

      const e = await listIssues(context, {});

      assert(e.isOk());
      assertEquals(e.value.length, 150);
      assertEquals(requests, [
        { limit: "100", offset: "0" },
        { limit: "100", offset: "100" },
      ]);
    },
  );

  await t.step(
    "rejects a non-integer limit without requesting the server",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      const e = await listIssues(context, { limit: 1.5 });

      assert(e.isErr());
      assertEquals(requests.length, 0);
    },
  );

  await t.step(
    "rejects a limit below one without requesting the server",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      const e = await listIssues(context, { limit: -1 });

      assert(e.isErr());
      assertEquals(requests.length, 0);
    },
  );

  await t.step(
    "rejects a zero limit without requesting the server",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      const e = await listIssues(context, { limit: 0 });

      assert(e.isErr());
      assertEquals(requests.length, 0);
    },
  );
});
