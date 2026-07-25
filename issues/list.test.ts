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

function includeHandler(includeParams: (string | null)[]) {
  return http.get(`${context.endpoint}/issues.json`, ({ request }) => {
    const url = new URL(request.url);
    includeParams.push(url.searchParams.get("include"));
    return HttpResponse.json({
      issues: [],
      total_count: 0,
      offset: 0,
      limit: 100,
    });
  });
}

Deno.test("list include option", async (t) => {
  await t.step(
    "sends a single include value as-is",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await Array.fromAsync(list(context, { include: "attachments" }));

      expect(includeParams).toStrictEqual(["attachments"]);
    },
  );

  await t.step(
    "sends an array of include values as a comma-joined list",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await Array.fromAsync(
        list(context, { include: ["attachments", "relations"] }),
      );

      expect(includeParams).toStrictEqual(["attachments,relations"]);
    },
  );

  await t.step(
    "dedups a repeated include value down to one occurrence",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await Array.fromAsync(
        list(context, { include: ["attachments", "attachments"] }),
      );

      expect(includeParams).toStrictEqual(["attachments"]);
    },
  );

  await t.step(
    "dedups duplicates while preserving first-seen order",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await Array.fromAsync(
        list(context, {
          include: ["attachments", "relations", "attachments"],
        }),
      );

      expect(includeParams).toStrictEqual(["attachments,relations"]);
    },
  );
});

Deno.test("an empty include array is rejected by the type", () => {
  // @ts-expect-error include must name at least one value
  const _option: Parameters<typeof list>[1] = { include: [] };
});

Deno.test("categoryId requires projectId at the type level", () => {
  // @ts-expect-error categoryId without projectId is not honored by Redmine
  const _missingProject: Parameters<typeof list>[1] = { categoryId: 1 };
  const _withProject: Parameters<typeof list>[1] = {
    categoryId: 1,
    projectId: 2,
  };
});

Deno.test("subprojectId requires projectId at the type level", () => {
  // @ts-expect-error subprojectId without projectId is not honored by Redmine
  const _missingProject: Parameters<typeof list>[1] = { subprojectId: "1" };
  const _withProject: Parameters<typeof list>[1] = {
    subprojectId: "1",
    projectId: 2,
  };
});

function queryHandler(recorded: URLSearchParams[]) {
  return http.get(`${context.endpoint}/issues.json`, ({ request }) => {
    recorded.push(new URL(request.url).searchParams);
    return HttpResponse.json({
      issues: [],
      total_count: 0,
      offset: 0,
      limit: 100,
    });
  });
}

Deno.test("list id-based filters", async (t) => {
  const cases: {
    name: string;
    option: Parameters<typeof list>[1];
    param: string;
    expected: string;
  }[] = [
    {
      name: "priorityId is sent as priority_id",
      option: { priorityId: 3 },
      param: "priority_id",
      expected: "3",
    },
    {
      name: "categoryId is sent as category_id",
      option: { categoryId: 7, projectId: 1 },
      param: "category_id",
      expected: "7",
    },
    {
      name: "fixedVersionId is sent as fixed_version_id",
      option: { fixedVersionId: 12 },
      param: "fixed_version_id",
      expected: "12",
    },
    {
      name: "authorId accepts a numeric id",
      option: { authorId: 5 },
      param: "author_id",
      expected: "5",
    },
    {
      name: "authorId accepts the me literal",
      option: { authorId: "me" },
      param: "author_id",
      expected: "me",
    },
  ];

  for (const { name, option, param, expected } of cases) {
    await t.step(name, async () => {
      const recorded: URLSearchParams[] = [];
      server.resetHandlers(queryHandler(recorded));

      await Array.fromAsync(list(context, option));

      expect(recorded.length).toStrictEqual(1);
      expect(recorded[0].get(param)).toStrictEqual(expected);
    });
  }
});

Deno.test("list date filters", async (t) => {
  const cases: {
    name: string;
    option: Parameters<typeof list>[1];
    param: string;
    expected: string;
  }[] = [
    {
      name: "a bare Date sends an exact-match filter",
      option: { createdOn: new Date("2026-07-01T00:00:00Z") },
      param: "created_on",
      expected: "=2026-07-01",
    },
    {
      name: "{ from } alone sends a lower-bound filter",
      option: { createdOn: { from: new Date("2026-07-01T00:00:00Z") } },
      param: "created_on",
      expected: ">=2026-07-01",
    },
    {
      name: "{ to } alone sends an upper-bound filter",
      option: { createdOn: { to: new Date("2026-07-31T00:00:00Z") } },
      param: "created_on",
      expected: "<=2026-07-31",
    },
    {
      name: "{ from, to } sends a range filter",
      option: {
        createdOn: {
          from: new Date("2026-07-01T00:00:00Z"),
          to: new Date("2026-07-31T00:00:00Z"),
        },
      },
      param: "created_on",
      expected: "><2026-07-01|2026-07-31",
    },
    {
      name:
        "the time part of a Date is dropped and the UTC calendar day is sent",
      option: { createdOn: new Date("2026-07-01T23:59:59Z") },
      param: "created_on",
      expected: "=2026-07-01",
    },
    {
      name: "startDate is sent as start_date",
      option: { startDate: new Date("2026-07-01T00:00:00Z") },
      param: "start_date",
      expected: "=2026-07-01",
    },
    {
      name: "dueDate is sent as due_date",
      option: { dueDate: new Date("2026-07-01T00:00:00Z") },
      param: "due_date",
      expected: "=2026-07-01",
    },
    {
      name: "updatedOn is sent as updated_on",
      option: { updatedOn: new Date("2026-07-01T00:00:00Z") },
      param: "updated_on",
      expected: "=2026-07-01",
    },
    {
      name: "closedOn is sent as closed_on",
      option: { closedOn: new Date("2026-07-01T00:00:00Z") },
      param: "closed_on",
      expected: "=2026-07-01",
    },
    {
      name: "{ daysAgo } sends a relative exact-match filter",
      option: { createdOn: { daysAgo: 3 } },
      param: "created_on",
      expected: "t-3",
    },
    {
      name:
        "{ from: { daysAgo } } sends a lower-bound filter with no upper bound",
      option: { createdOn: { from: { daysAgo: 3 } } },
      param: "created_on",
      expected: ">t-3",
    },
    {
      name: "{ to: { daysAgo } } sends an upper-bound filter",
      option: { createdOn: { to: { daysAgo: 3 } } },
      param: "created_on",
      expected: "<t-3",
    },
    {
      name: '{ from: { daysAgo }, to: "today" } sends a bounded range filter',
      option: { createdOn: { from: { daysAgo: 3 }, to: "today" } },
      param: "created_on",
      expected: "><t-3",
    },
    {
      name: "{ daysFromNow } sends a relative exact-match filter",
      option: { dueDate: { daysFromNow: 5 } },
      param: "due_date",
      expected: "t+5",
    },
    {
      name: "{ from: { daysFromNow } } sends a lower-bound filter",
      option: { dueDate: { from: { daysFromNow: 5 } } },
      param: "due_date",
      expected: ">t+5",
    },
    {
      name:
        "{ to: { daysFromNow } } sends an upper-bound filter with no lower bound",
      option: { dueDate: { to: { daysFromNow: 5 } } },
      param: "due_date",
      expected: "<t+5",
    },
    {
      name:
        '{ from: "today", to: { daysFromNow } } sends a bounded range filter',
      option: { dueDate: { from: "today", to: { daysFromNow: 5 } } },
      param: "due_date",
      expected: "><t+5",
    },
    {
      name: '"today" sends a named-period filter',
      option: { createdOn: "today" },
      param: "created_on",
      expected: "t",
    },
    {
      name: '"yesterday" sends a named-period filter',
      option: { createdOn: "yesterday" },
      param: "created_on",
      expected: "ld",
    },
    {
      name: '"thisWeek" sends a named-period filter',
      option: { createdOn: "thisWeek" },
      param: "created_on",
      expected: "w",
    },
    {
      name: '"lastWeek" sends a named-period filter',
      option: { createdOn: "lastWeek" },
      param: "created_on",
      expected: "lw",
    },
    {
      name: '"lastTwoWeeks" sends a named-period filter',
      option: { createdOn: "lastTwoWeeks" },
      param: "created_on",
      expected: "l2w",
    },
    {
      name: '"thisMonth" sends a named-period filter',
      option: { createdOn: "thisMonth" },
      param: "created_on",
      expected: "m",
    },
    {
      name: '"lastMonth" sends a named-period filter',
      option: { createdOn: "lastMonth" },
      param: "created_on",
      expected: "lm",
    },
    {
      name: '"thisYear" sends a named-period filter',
      option: { createdOn: "thisYear" },
      param: "created_on",
      expected: "y",
    },
    {
      name: '"any" sends a value-presence filter',
      option: { createdOn: "any" },
      param: "created_on",
      expected: "*",
    },
    {
      name: '"none" sends a value-presence filter',
      option: { createdOn: "none" },
      param: "created_on",
      expected: "!*",
    },
    {
      name: '"tomorrow" sends a named-period filter',
      option: { dueDate: "tomorrow" },
      param: "due_date",
      expected: "nd",
    },
    {
      name: '"nextWeek" sends a named-period filter',
      option: { dueDate: "nextWeek" },
      param: "due_date",
      expected: "nw",
    },
    {
      name: '"nextMonth" sends a named-period filter',
      option: { dueDate: "nextMonth" },
      param: "due_date",
      expected: "nm",
    },
  ];

  for (const { name, option, param, expected } of cases) {
    await t.step(name, async () => {
      const recorded: URLSearchParams[] = [];
      server.resetHandlers(queryHandler(recorded));

      await Array.fromAsync(list(context, option));

      expect(recorded.length).toStrictEqual(1);
      expect(recorded[0].get(param)).toStrictEqual(expected);
    });
  }

  await t.step(
    "omitting every date filter sends no date parameter",
    async () => {
      const recorded: URLSearchParams[] = [];
      server.resetHandlers(queryHandler(recorded));

      await Array.fromAsync(list(context, {}));

      expect(recorded.length).toStrictEqual(1);
      for (
        const param of [
          "start_date",
          "due_date",
          "created_on",
          "updated_on",
          "closed_on",
        ]
      ) {
        expect(recorded[0].get(param)).toBeNull();
      }
    },
  );

  await t.step(
    "createdOn and dueDate given together are both sent",
    async () => {
      const recorded: URLSearchParams[] = [];
      server.resetHandlers(queryHandler(recorded));

      await Array.fromAsync(list(context, {
        createdOn: new Date("2026-07-01T00:00:00Z"),
        dueDate: { from: new Date("2026-07-10T00:00:00Z") },
      }));

      expect(recorded.length).toStrictEqual(1);
      expect(recorded[0].get("created_on")).toStrictEqual("=2026-07-01");
      expect(recorded[0].get("due_date")).toStrictEqual(">=2026-07-10");
    },
  );

  await t.step(
    "a date filter given alongside customField does not drop either parameter",
    async () => {
      const recorded: URLSearchParams[] = [];
      server.resetHandlers(queryHandler(recorded));

      await Array.fromAsync(list(context, {
        createdOn: new Date("2026-07-01T00:00:00Z"),
        customField: [{ id: 1, value: "hi" }],
      }));

      expect(recorded.length).toStrictEqual(1);
      expect(recorded[0].get("created_on")).toStrictEqual("=2026-07-01");
      expect(recorded[0].get("cf_1")).toStrictEqual("hi");
    },
  );
});

Deno.test("an empty date filter object is rejected by the type", () => {
  // @ts-expect-error a date filter must set at least one of from/to
  const _option: Parameters<typeof list>[1] = { createdOn: {} };
});

Deno.test(
  "mixing an absolute bound with a relative bound is rejected by the type",
  () => {
    const someDate = new Date("2026-07-01T00:00:00Z");
    const _option: Parameters<typeof list>[1] = {
      // @ts-expect-error "today" is not an absolute bound in this increment
      createdOn: { from: someDate, to: "today" },
    };
  },
);

Deno.test(
  "a future-looking filter on createdOn is rejected by the type",
  () => {
    const _option: Parameters<typeof list>[1] = {
      // @ts-expect-error createdOn is PastDateFilter; :date_past rejects daysFromNow with a 422
      createdOn: { daysFromNow: 3 },
    };
  },
);

Deno.test(
  "a future-looking named period on createdOn is rejected by the type",
  async (t) => {
    await t.step('"tomorrow"', () => {
      const _option: Parameters<typeof list>[1] = {
        // @ts-expect-error createdOn is PastDateFilter; :date_past rejects "tomorrow" with a 422
        createdOn: "tomorrow",
      };
    });

    await t.step('"nextWeek"', () => {
      const _option: Parameters<typeof list>[1] = {
        // @ts-expect-error createdOn is PastDateFilter; :date_past rejects "nextWeek" with a 422
        createdOn: "nextWeek",
      };
    });

    await t.step('"nextMonth"', () => {
      const _option: Parameters<typeof list>[1] = {
        // @ts-expect-error createdOn is PastDateFilter; :date_past rejects "nextMonth" with a 422
        createdOn: "nextMonth",
      };
    });
  },
);

Deno.test(
  "a negative day count is rejected at parse time",
  async () => {
    const recorded: URLSearchParams[] = [];
    server.resetHandlers(queryHandler(recorded));

    await expect(Array.fromAsync(list(context, { createdOn: { daysAgo: -1 } })))
      .rejects.toThrow();
    expect(recorded.length).toStrictEqual(0);
  },
);

Deno.test(
  "a fractional day count is rejected at parse time",
  async () => {
    const recorded: URLSearchParams[] = [];
    server.resetHandlers(queryHandler(recorded));

    await expect(
      Array.fromAsync(list(context, { createdOn: { daysAgo: 1.5 } })),
    ).rejects.toThrow();
    expect(recorded.length).toStrictEqual(0);
  },
);
