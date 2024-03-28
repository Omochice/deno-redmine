import { fetchList } from "./list.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.221.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

const sampleProjects = [
  {
    id: 3,
    name: "sample3",
    identifier: "sample3",
    description: "sample project 3",
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-03-01t00:00:00.000z",
    updated_on: "1971-03-01t00:00:00.000z",
    parent: undefined,
  },
  {
    id: 2,
    name: "sample2",
    identifier: "sample2",
    description: null,
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-02-01t00:00:00.000z",
    updated_on: "1971-02-01t00:00:00.000z",
    parent: undefined,
  },
  {
    id: 1,
    name: "sample project name",
    identifier: "sample",
    description: "sample project",
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-01-01t00:00:00.000z",
    updated_on: "1971-01-01t00:00:00.000z",
    parent: undefined,
  },
] as const;

Deno.test("test for redmine project 'list' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should be success", async () => {
    mockFetch
      .intercept((input) => {
        const lhs = new URL(input);
        const rhs = new URL(join(context.endpoint, "projects.json"));
        return lhs.origin === rhs.origin;
      }, {
        method: "GET",
      })
      .response(
        JSON.stringify({
          projects: sampleProjects,
          total_count: 3,
          offset: 0,
          limit: 25,
        }),
        { status: 200 },
      )
      .times(2);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept((input) => {
          const lhs = new URL(input);
          const rhs = new URL(join(context.endpoint, "projects.json"));
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
      const e = await fetchList(context);
      assert(e.isErr());
    },
  );

  mockFetch.deactivate();
});
