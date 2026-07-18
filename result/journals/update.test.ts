import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /journals/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(context, 1, { notes: "edited" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, 422, { notes: "edited" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await update(context, 404, { notes: "edited" });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.resetHandlers(
        http.put(
          `${context.endpoint}/journals/:id.json`,
          async ({ request }) => {
            const body = await request.json() as {
              journal: typeof captured;
            };
            captured = body.journal;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await update(context, 1, {
        notes: "edited",
        privateNotes: true,
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.notes).toStrictEqual("edited");
      expect(captured?.private_notes).toStrictEqual(true);
    },
  );
});
