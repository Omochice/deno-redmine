import { addWatcher } from "./add-watcher.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("POST /issues/:id/watchers.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(addWatcher(context, 1, 1)).resolves.toBeUndefined();
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

      await addWatcher(context, 1, 5);

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.user_id).toStrictEqual(5);
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(addWatcher(context, 422, 1)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(addWatcher(context, 404, 1)).rejects.toThrow();
  });
});
