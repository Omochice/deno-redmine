import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@3.0.1";
import { setupServer } from "npm:msw@3.0.1/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /journals/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(update(context, 1, { notes: "edited" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(update(context, 422, { notes: "edited" })).rejects
        .toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(update(context, 404, { notes: "edited" })).rejects
      .toThrow();
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
      await update(context, 1, {
        notes: "edited",
        privateNotes: true,
      });
      expect(captured?.notes).toStrictEqual("edited");
      expect(captured?.private_notes).toStrictEqual(true);
    },
  );
});
