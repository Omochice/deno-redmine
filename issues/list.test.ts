import { list } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /issues.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const issues = await Array.fromAsync(list(context));
    expect(issues).toBeDefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(Array.fromAsync(list(context))).rejects.toThrow();
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

Deno.test("list limit option", async (t) => {
  await t.step(
    "returns at most `limit` issues with a single page request when limit <= page size",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      const issues = await Array.fromAsync(list(context, { limit: 1 }));

      expect(issues.length).toStrictEqual(1);
      expect(requests.length).toStrictEqual(1);
      expect(requests[0]).toStrictEqual({ limit: "1", offset: "0" });
    },
  );

  await t.step(
    "fetches only as many pages as needed to satisfy a limit spanning multiple pages",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(300, requests));

      const issues = await Array.fromAsync(list(context, { limit: 150 }));

      expect(issues.length).toStrictEqual(150);
      expect(requests).toStrictEqual([
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

      const issues = await Array.fromAsync(list(context, {}));

      expect(issues.length).toStrictEqual(150);
      expect(requests).toStrictEqual([
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

      await expect(Array.fromAsync(list(context, { limit: 1.5 })))
        .rejects.toThrow();
      expect(requests.length).toStrictEqual(0);
    },
  );

  await t.step(
    "rejects a limit below one without requesting the server",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      await expect(Array.fromAsync(list(context, { limit: -1 })))
        .rejects.toThrow();
      expect(requests.length).toStrictEqual(0);
    },
  );

  await t.step(
    "rejects a zero limit without requesting the server",
    async () => {
      const requests: RecordedRequest[] = [];
      server.resetHandlers(pagingHandler(5, requests));

      await expect(Array.fromAsync(list(context, { limit: 0 })))
        .rejects.toThrow();
      expect(requests.length).toStrictEqual(0);
    },
  );
});
