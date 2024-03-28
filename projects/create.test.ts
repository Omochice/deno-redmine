import { create } from "./create.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.221.0/assert/mod.ts";

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

Deno.test("test for redmine project 'create' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  await t.step("if got 200, should be success", async () => {
    mockFetch
      .intercept(join(context.endpoint, "projects.json"), {
        method: "POST",
      })
      .response(JSON.stringify({}), { status: 200 });
    const e = await create({ name: "sample", identifier: "sample" }, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const errorSample = { errors: ["sample error"] };
      mockFetch
        .intercept(join(context.endpoint, "projects.json"), {
          method: "POST",
        })
        .response(JSON.stringify(errorSample), {
          status: 422,
          statusText: "Unprocessable Entity",
        });
      const e = await create({ name: "sample", identifier: "sample" }, context);
      assert(e.isErr());
      assertEquals(
        e.error.message,
        JSON.stringify(errorSample.errors),
      );
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    mockFetch
      .intercept(join(context.endpoint, "projects.json"), {
        method: "POST",
      })
      .response(JSON.stringify("unknown error"), {
        status: 404,
        statusText: "Not found",
      });
    const e = await create({ name: "sample", identifier: "sample" }, context);
    assert(e.isErr());
  });

  mockFetch.deactivate();
});
