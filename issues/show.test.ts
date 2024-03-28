import { show } from "./show.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.221.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

const sampleIssue = {
  id: 1,
  project: { id: 1, name: "sample project" },
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
} as const;

Deno.test("test for redmine issue 'show' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should return ok", async () => {
    mockFetch
      .intercept(join(context.endpoint, "issues", "1.json"), {
        method: "GET",
      })
      .response(JSON.stringify({ issue: sampleIssue }), { status: 200 });
    const e = await show(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept(join(context.endpoint, "issues", "1.json"), {
          method: "GET",
        })
        .response(JSON.stringify(errorSample), {
          status: 422,
          statusText: "Unprocessable Entity",
        });
      const e = await show(1, context);
      assert(e.isErr());
    },
  );

  mockFetch.deactivate();
});
