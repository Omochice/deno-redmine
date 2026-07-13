import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
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
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create(c, { projectId: 1, hours: 2 });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await create(c, { projectId: 1, hours: 2 });
    assert(e.isErr());
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
      assert(e.isOk());
      assertEquals(captured?.issue_id, 5);
      assertEquals(captured?.hours, 2.5);
      assertEquals(captured?.activity_id, 9);
      assertEquals(captured?.comments, "Worked on it");
      assertEquals(captured?.spent_on, "2026-07-01");
    },
  );
});
