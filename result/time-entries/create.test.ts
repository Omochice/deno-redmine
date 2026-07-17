import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /time_entries.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(context, { projectId: 1, hours: 2 });
      expect(e.isOk()).toBe(true);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create(c, { projectId: 1, hours: 2 });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await create(c, { projectId: 1, hours: 2 });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/time_entries.json`,
          async ({ request }) => {
            const body = await request.json() as {
              time_entry: typeof captured;
            };
            captured = body.time_entry;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, {
        issueId: 5,
        hours: 2.5,
        activityId: 9,
        comments: "Worked on it",
        spentOn: new Date("2026-07-01"),
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.issue_id).toStrictEqual(5);
      expect(captured?.hours).toStrictEqual(2.5);
      expect(captured?.activity_id).toStrictEqual(9);
      expect(captured?.comments).toStrictEqual("Worked on it");
      expect(captured?.spent_on).toStrictEqual("2026-07-01");
    },
  );
});
