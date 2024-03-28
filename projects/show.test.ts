import { show } from "./show.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import { assert } from "https://deno.land/std@0.221.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

const sampleProject = {
  id: 1,
  name: "sample project name",
  identifier: "sample",
  description: "sample project",
  homepage: "",
  status: 1,
  is_public: true,
  inherit_members: false,
  enable_new_ticket_message: undefined,
  new_ticket_message: undefined,
  default_version: undefined,
  created_on: "1970-01-01T00:00:00.000Z",
  updated_on: "1971-01-01T00:00:00.000Z",
  parent: undefined,
} as const;

Deno.test("test for redmine project 'show' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should return ok", async () => {
    mockFetch
      .intercept(join(context.endpoint, "projects", "1.json"), {
        method: "GET",
      })
      .response(JSON.stringify({ project: sampleProject }), { status: 200 });
    const e = await show(1, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept(join(context.endpoint, "projects", "1.json"), {
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
