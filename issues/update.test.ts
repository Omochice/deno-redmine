import { update } from "./update.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";
import type { UpdateIssueQuery } from "./type.ts";

const server = setupServer();
server.listen();

async function sentIssue(
  query: UpdateIssueQuery,
): Promise<Record<string, unknown>> {
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

  await update(context, 1, query);

  expect(capturedBody).toBeDefined();
  return capturedBody!.issue;
}

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
      const issue = await sentIssue({
        subject: "updated subject",
        notes: "a note",
        privateNotes: true,
        doneRatio: 90,
        isPrivate: true,
        estimatedHours: 8,
        startDate: new Date("2026-07-01"),
        dueDate: new Date("2026-07-31"),
      });

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
    "should send fixedVersionId as fixed_version_id in the request body",
    async () => {
      const issue = await sentIssue({ fixedVersionId: 2 });

      expect(issue.fixed_version_id).toStrictEqual(2);
    },
  );

  await t.step(
    "should send a null fixedVersionId as fixed_version_id: null to detach the version",
    async () => {
      const issue = await sentIssue({ fixedVersionId: null });

      expect(issue).toStrictEqual({ fixed_version_id: null });
    },
  );

  await t.step(
    "should send statusId, priorityId, and trackerId as snake_case ids",
    async () => {
      const issue = await sentIssue({
        statusId: 2,
        priorityId: 3,
        trackerId: 4,
      });

      expect(issue).toStrictEqual({
        status_id: 2,
        priority_id: 3,
        tracker_id: 4,
      });
    },
  );

  await t.step(
    "should send assignedToId, categoryId, and parentIssueId as snake_case ids",
    async () => {
      const issue = await sentIssue({
        assignedToId: 5,
        categoryId: 6,
        parentIssueId: 7,
      });

      expect(issue).toStrictEqual({
        assigned_to_id: 5,
        category_id: 6,
        parent_issue_id: 7,
      });
    },
  );

  await t.step(
    "should keep custom field values in the request body",
    async () => {
      const issue = await sentIssue({
        customFields: [
          { id: 1, name: "text field", value: "hello" },
          { id: 2, name: "list field", multiple: true, value: ["a", "b"] },
        ],
      });

      expect(issue.custom_fields).toStrictEqual([
        { id: 1, value: "hello" },
        { id: 2, value: ["a", "b"] },
      ]);
    },
  );
});

Deno.test("statusId, priorityId, and trackerId reject null at the type level", () => {
  // @ts-expect-error Redmine requires a status, so it cannot be cleared
  const _status: Parameters<typeof update>[2] = { statusId: null };
  // @ts-expect-error Redmine requires a priority, so it cannot be cleared
  const _priority: Parameters<typeof update>[2] = { priorityId: null };
  // @ts-expect-error Redmine requires a tracker, so it cannot be cleared
  const _tracker: Parameters<typeof update>[2] = { trackerId: null };
});
