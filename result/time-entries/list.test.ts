import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /time_entries.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await fetchList(c);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await fetchList(c);
    assert(e.isErr());
  });

  await t.step("should map camelCase fields from the response", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
    const entry = e.value.find((timeEntry) => timeEntry.id === 3);
    assert(entry !== undefined);
    assertEquals(entry.project, { id: 1, name: "Demo" });
    assertEquals(entry.issue, { id: 5 });
    assertEquals(entry.activity, { id: 9, name: "Development" });
    assertEquals(entry.hours, 2.5);

    const entryWithoutIssue = e.value.find((timeEntry) => timeEntry.id === 2);
    assert(entryWithoutIssue !== undefined);
    assertEquals(entryWithoutIssue.issue, undefined);
    assertEquals(entryWithoutIssue.comments, undefined);
  });

  await t.step(
    "should send filters as snake_case query params",
    async () => {
      let captured: URLSearchParams | undefined;
      server.use(
        http.get(`${context.endpoint}/time_entries.json`, ({ request }) => {
          captured = new URL(request.url).searchParams;
          return HttpResponse.json({
            time_entries: [],
            total_count: 0,
            offset: 0,
            limit: 25,
          });
        }),
      );
      const e = await fetchList(context, {
        projectId: 1,
        userId: 2,
        spentOn: new Date("2026-07-01"),
        from: new Date("2026-07-01"),
        to: new Date("2026-07-31"),
      });
      assert(e.isOk());
      assertEquals(captured?.get("project_id"), "1");
      assertEquals(captured?.get("user_id"), "2");
      assertEquals(captured?.get("spent_on"), "2026-07-01");
      assertEquals(captured?.get("from"), "2026-07-01");
      assertEquals(captured?.get("to"), "2026-07-31");
    },
  );

  await t.step(
    "should omit filters passed as explicit undefined",
    async () => {
      let captured: URLSearchParams | undefined;
      server.use(
        http.get(`${context.endpoint}/time_entries.json`, ({ request }) => {
          captured = new URL(request.url).searchParams;
          return HttpResponse.json({
            time_entries: [],
            total_count: 0,
            offset: 0,
            limit: 25,
          });
        }),
      );
      const e = await fetchList(context, { projectId: undefined });
      assert(e.isOk());
      assertEquals(captured?.has("project_id"), false);
      assert(!captured?.toString().includes("undefined"));
    },
  );
});
