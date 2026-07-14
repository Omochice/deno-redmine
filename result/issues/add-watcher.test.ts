import { addWatcher } from "./add-watcher.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("POST /issues/:id/watchers.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await addWatcher(context, 1, 1);
    assert(e.isOk());
  });

  await t.step(
    "should send the user id as user_id in the request body",
    async () => {
      let capturedBody: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/issues/:id/watchers.json`,
          async ({ request }) => {
            capturedBody = await request.json() as Record<string, unknown>;
            return HttpResponse.json({});
          },
        ),
      );

      const e = await addWatcher(context, 1, 5);
      assert(e.isOk());

      assert(capturedBody !== undefined);
      assertEquals(capturedBody.user_id, 5);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await addWatcher(context, 422, 1);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await addWatcher(context, 404, 1);
    assert(e.isErr());
  });
});
