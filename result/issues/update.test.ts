import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/issues/:id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await update(context, 1, { notes: "sample" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await update(context, 411, { notes: "sample" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await update(context, 404, { notes: "sample" });
    expect(e.isErr()).toBe(true);
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
      expect(e.isOk()).toBe(true);

      expect(capturedBody !== undefined).toBe(true);
      const { issue } = capturedBody!;
      expect(issue.subject).toEqual("updated subject");
      expect(issue.notes).toEqual("a note");
      expect(issue.private_notes).toEqual(true);
      expect(issue.done_ratio).toEqual(90);
      expect(issue.is_private).toEqual(true);
      expect(issue.estimated_hours).toEqual(8);
      expect(issue.start_date).toEqual("2026-07-01");
      expect(issue.due_date).toEqual("2026-07-31");
    },
  );

  await t.step(
    "should keep custom field values in the request body",
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
        customFields: [
          { id: 1, name: "text field", value: "hello" },
          { id: 2, name: "list field", multiple: true, value: ["a", "b"] },
        ],
      });
      expect(e.isOk()).toBe(true);

      expect(capturedBody !== undefined).toBe(true);
      expect(capturedBody!.issue.custom_fields).toEqual([
        { id: 1, value: "hello" },
        { id: 2, value: ["a", "b"] },
      ]);
    },
  );
});
