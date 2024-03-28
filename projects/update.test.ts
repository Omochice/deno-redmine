import { update } from "./update.ts";
import { MockFetch } from "https://deno.land/x/deno_mock_fetch@1.0.1/mod.ts";
import { join } from "https://deno.land/std@0.221.0/path/mod.ts";
import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.221.0/assert/mod.ts";

const urlTable = new Map([
  [1, {
    status: 200,
    obj: {},
  }],
  [2, {
    status: 422,
    obj: { errors: ["some error"] },
  }],
  [3, {
    status: 404,
    obj: "not found",
  }],
]);

const context = {
  apiKey: "sample",
  endpoint: "http://readmine.example.com",
};

Deno.test("test for redmine project 'update' endpoint", async (t) => {
  const mockFetch = new MockFetch();
  for (const [id, { status, obj }] of urlTable.entries()) {
    mockFetch
      .intercept(join(context.endpoint, "projects", `${id}.json`), {
        method: "PUT",
      })
      .response(JSON.stringify(obj), { status })
      .persist();
  }

  await t.step("if got 200, should be success", async () => {
    const e = await update(1, { name: "sample" }, context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      const e = await update(2, { name: "sample" }, context);
      assert(e.isErr());
      assertEquals(
        e.error.message,
        JSON.stringify((urlTable.get(2)?.obj as { errors: string[] }).errors),
      );
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    const e = await update(3, { name: "sample" }, context);
    assert(e.isErr());
  });

  mockFetch.deactivate();
});
