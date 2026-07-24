import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /issues/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const issue = await show(context, 1);
    expect(issue).toBeDefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(show(context, 1)).rejects.toThrow();
    },
  );
});

function includeHandler(includeParams: (string | null)[]) {
  return http.get(`${context.endpoint}/issues/:id.json`, ({ request }) => {
    const url = new URL(request.url);
    includeParams.push(url.searchParams.get("include"));
    return HttpResponse.json({
      issue: {
        id: 1,
        project: { id: 1, name: "sample project" },
        tracker: { id: 1, name: "issue" },
        status: { id: 1, name: "open", is_closed: false },
        priority: { id: 1, name: "normal" },
        author: { id: 1, name: "sample user" },
        assigned_to: { id: 1, name: "Redmine Admin" },
        category: undefined,
        subject: "sample1",
        description: "",
        start_date: "2023-10-09T00:00:00Z",
        due_date: null,
        done_ratio: 0,
        is_private: false,
        estimated_hours: null,
        total_estimated_hours: 0,
        spent_hours: 0,
        total_spent_hours: 0,
        created_on: "2023-10-09T12:17:17Z",
        updated_on: "2023-10-09T12:17:17Z",
        closed_on: null,
        custom_fields: undefined,
      },
    });
  });
}

Deno.test("GET /issues/:id.json include option", async (t) => {
  await t.step(
    "sends a single include value as-is",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await show(context, 1, "attachments");

      expect(includeParams).toStrictEqual(["attachments"]);
    },
  );

  await t.step(
    "sends an array of include values as a comma-joined list",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await show(context, 1, ["attachments", "relations"]);

      expect(includeParams).toStrictEqual(["attachments,relations"]);
    },
  );

  await t.step(
    "dedups a repeated include value down to one occurrence",
    async () => {
      const includeParams: (string | null)[] = [];
      server.resetHandlers(includeHandler(includeParams));

      await show(context, 1, ["attachments", "attachments"]);

      expect(includeParams).toStrictEqual(["attachments"]);
    },
  );
});

Deno.test("an empty include array is rejected by the type", () => {
  // @ts-expect-error include must name at least one value
  const _includes: Parameters<typeof show>[2] = [];
});
