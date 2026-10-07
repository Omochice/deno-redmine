import { createIssue } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context } from "./_mock.ts";
import { setupServer } from "../_msw.ts";
import { http, HttpResponse } from "npm:msw@3.0.2";
import type { CreateIssueQuery } from "./type.ts";

const server = setupServer();
server.listen();

async function sentIssue(
  query: Partial<CreateIssueQuery>,
): Promise<Record<string, unknown>> {
  let capturedBody: { issue: Record<string, unknown> } | undefined;
  server.resetHandlers(
    http.post(`${context.endpoint}/issues.json`, async ({ request }) => {
      capturedBody = await request.json() as {
        issue: Record<string, unknown>;
      };
      return HttpResponse.json({});
    }),
  );

  await createIssue(context, {
    projectId: 1,
    trackerId: 1,
    statusId: 1,
    priorityId: 1,
    subject: "sample",
    ...query,
  });

  expect(capturedBody).toBeDefined();
  return capturedBody!.issue;
}

Deno.test("POST /issues.json", async (t) => {
  await t.step(
    "should keep custom field id and single string value in the request body",
    async () => {
      const issue = await sentIssue({
        customFields: [{ id: 1, value: "hello" }],
      });

      expect(issue.custom_fields).toStrictEqual([
        { id: 1, value: "hello" },
      ]);
    },
  );

  await t.step(
    "should keep custom field id and multi-value string array in the request body",
    async () => {
      const issue = await sentIssue({
        customFields: [{ id: 2, value: ["a", "b"] }],
      });

      expect(issue.custom_fields).toStrictEqual([
        { id: 2, value: ["a", "b"] },
      ]);
    },
  );

  await t.step(
    "should send startDate and dueDate as YYYY-MM-DD strings in the request body",
    async () => {
      const issue = await sentIssue({
        startDate: new Date("2026-07-01"),
        dueDate: new Date("2026-07-31"),
      });

      expect(issue.start_date).toStrictEqual("2026-07-01");
      expect(issue.due_date).toStrictEqual("2026-07-31");
    },
  );

  await t.step(
    "should send every upload field in snake_case in the request body",
    async () => {
      const issue = await sentIssue({
        uploads: [{
          token: "abc",
          filename: "a.txt",
          description: "desc",
          contentType: "text/plain",
        }],
      });

      expect(issue.uploads).toStrictEqual([
        {
          token: "abc",
          filename: "a.txt",
          description: "desc",
          content_type: "text/plain",
        },
      ]);
    },
  );

  await t.step(
    "should send an upload given only a token as just the token",
    async () => {
      const issue = await sentIssue({ uploads: [{ token: "abc" }] });

      expect(issue.uploads).toStrictEqual([{ token: "abc" }]);
    },
  );
});
