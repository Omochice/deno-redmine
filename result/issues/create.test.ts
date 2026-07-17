import { createIssue } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { http, HttpResponse } from "npm:msw@2.15.0";

const server = setupServer();
server.listen();

Deno.test("POST /issues.json", async (t) => {
  await t.step(
    "should keep custom field id and single string value in the request body",
    async () => {
      let capturedBody: { issue: Record<string, unknown> } | undefined;
      server.resetHandlers(
        http.post(`${context.endpoint}/issues.json`, async ({ request }) => {
          capturedBody = await request.json() as {
            issue: Record<string, unknown>;
          };
          return HttpResponse.json({});
        }),
      );

      const e = await createIssue(context, {
        projectId: 1,
        trackerId: 1,
        statusId: 1,
        priorityId: 1,
        subject: "sample",
        customFields: [{ id: 1, value: "hello" }],
      });
      expect(e.isOk()).toBe(true);

      expect(capturedBody !== undefined).toBe(true);
      expect(capturedBody!.issue.custom_fields).toEqual([
        { id: 1, value: "hello" },
      ]);
    },
  );

  await t.step(
    "should keep custom field id and multi-value string array in the request body",
    async () => {
      let capturedBody: { issue: Record<string, unknown> } | undefined;
      server.resetHandlers(
        http.post(`${context.endpoint}/issues.json`, async ({ request }) => {
          capturedBody = await request.json() as {
            issue: Record<string, unknown>;
          };
          return HttpResponse.json({});
        }),
      );

      const e = await createIssue(context, {
        projectId: 1,
        trackerId: 1,
        statusId: 1,
        priorityId: 1,
        subject: "sample",
        customFields: [{ id: 2, value: ["a", "b"] }],
      });
      expect(e.isOk()).toBe(true);

      expect(capturedBody !== undefined).toBe(true);
      expect(capturedBody!.issue.custom_fields).toEqual([
        { id: 2, value: ["a", "b"] },
      ]);
    },
  );
});
