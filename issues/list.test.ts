import { listIssues } from "./list.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.221.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

const sampleIssues = [
  {
    id: 3,
    project: { id: 1, name: "hi" },
    tracker: { id: 1, name: "issue" },
    status: { id: 4, name: "closed", is_closed: true },
    priority: { id: 1, name: "normal" },
    author: { id: 1, name: "sample user" },
    assigned_to: { id: 1, name: "sample user" },
    category: undefined,
    subject: "closed",
    description: "",
    start_date: "2023-10-10T00:00:00Z",
    due_date: null,
    done_ratio: 0,
    is_private: false,
    estimated_hours: null,
    total_estimated_hours: 0,
    spent_hours: 0,
    total_spent_hours: 0,
    created_on: "2023-10-10T13:19:24Z",
    updated_on: "2023-10-10T13:20:47Z",
    closed_on: "2023-10-10T13:20:47Z",
    custom_fields: undefined,
  },
  {
    id: 2,
    project: { id: 1, name: "hi" },
    tracker: { id: 1, name: "issue" },
    status: { id: 1, name: "open", is_closed: false },
    priority: { id: 1, name: "noreal" },
    author: { id: 1, name: "sample user" },
    assigned_to: undefined,
    category: undefined,
    subject: "not asigned",
    description: "",
    start_date: "2023-10-09T00:00:00Z",
    due_date: null,
    done_ratio: 0,
    is_private: false,
    estimated_hours: null,
    total_estimated_hours: 0,
    spent_hours: 0,
    total_spent_hours: 0,
    created_on: "2023-10-09T14:52:19Z",
    updated_on: "2023-10-09T14:52:19Z",
    closed_on: null,
    custom_fields: undefined,
  },
  {
    id: 1,
    project: { id: 1, name: "hi" },
    tracker: { id: 1, name: "issue" },
    status: { id: 1, name: "open", is_closed: false },
    priority: { id: 1, name: "normal" },
    author: { id: 1, name: "sample user" },
    assigned_to: { id: 1, name: "Redmine Admin" },
    category: undefined,
    subject: "sample1",
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
  },
] as const;

Deno.test("test for redmine issue 'list' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should be success", async () => {
    mockFetch
      .intercept((input) => {
        const lhs = new URL(input);
        const rhs = new URL(join(context.endpoint, "issues.json"));
        return lhs.origin === rhs.origin;
      }, {
        method: "GET",
      })
      .response(
        JSON.stringify({
          issues: sampleIssues,
          total_count: 3,
          offset: 0,
          limit: 25,
        }),
        { status: 200 },
      )
      .times(2);
    const e = await listIssues(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept((input) => {
          const lhs = new URL(input);
          const rhs = new URL(join(context.endpoint, "issues.json"));
          return lhs.origin === rhs.origin;
        }, {
          method: "GET",
        })
        .response(
          JSON.stringify(errorSample),
          {
            status: 422,
            statusText: "Unprocessable Entity",
          },
        );
      const e = await listIssues(context);
      assert(e.isErr());
    },
  );

  mockFetch.deactivate();
});
