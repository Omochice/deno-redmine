import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("PUT /issues/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    await expect(update(context, 1, { notes: "sample" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(update(context, 411, { notes: "sample" })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    await expect(update(context, 404, { notes: "sample" })).rejects.toThrow();
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

      await update(context, 1, {
        subject: "updated subject",
        notes: "a note",
        privateNotes: true,
        doneRatio: 90,
        isPrivate: true,
        estimatedHours: 8,
        startDate: new Date("2026-07-01"),
        dueDate: new Date("2026-07-31"),
      });

      expect(capturedBody).toBeDefined();
      const { issue } = capturedBody!;
      expect(issue.subject).toStrictEqual("updated subject");
      expect(issue.notes).toStrictEqual("a note");
      expect(issue.private_notes).toStrictEqual(true);
      expect(issue.done_ratio).toStrictEqual(90);
      expect(issue.is_private).toStrictEqual(true);
      expect(issue.estimated_hours).toStrictEqual(8);
      expect(issue.start_date).toStrictEqual("2026-07-01");
      expect(issue.due_date).toStrictEqual("2026-07-31");
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

      await update(context, 1, {
        customFields: [
          { id: 1, name: "text field", value: "hello" },
          { id: 2, name: "list field", multiple: true, value: ["a", "b"] },
        ],
      });

      expect(capturedBody).toBeDefined();
      expect(capturedBody!.issue.custom_fields).toStrictEqual([
        { id: 1, value: "hello" },
        { id: 2, value: ["a", "b"] },
      ]);
    },
  );
});
