import { update } from "./update.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/issues/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(context, 1, { notes: "sample" });
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, 411, { notes: "sample" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await update(context, 404, { notes: "sample" });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase fields as snake_case in the request body",
    async () => {
      let capturedBody: { issue: Record<string, unknown> } | undefined;
      server.resetHandlers(
        http.put(
          `${context.endpoint}/issues/:id.json`,
          async ({ request }) => {
            capturedBody = await request.json() as {
              issue: Record<string, unknown>;
            };
            return HttpResponse.json({});
          },
        ),
      );

      const e = await update(context, 1, {
        subject: "updated subject",
        notes: "a note",
        privateNotes: true,
        doneRatio: 90,
        isPrivate: true,
        estimatedHours: 8,
        startDate: new Date("2026-07-01"),
        dueDate: new Date("2026-07-31"),
      });
      assert(e.isOk());

      assert(capturedBody !== undefined);
      const { issue } = capturedBody;
      assertEquals(issue.subject, "updated subject");
      assertEquals(issue.notes, "a note");
      assertEquals(issue.private_notes, true);
      assertEquals(issue.done_ratio, 90);
      assertEquals(issue.is_private, true);
      assertEquals(issue.estimated_hours, 8);
      assertEquals(issue.start_date, "2026-07-01");
      assertEquals(issue.due_date, "2026-07-31");
    },
  );
});
