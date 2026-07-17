import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /time_entries.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await fetchList(c);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await fetchList(c);
    expect(e.isErr()).toBe(true);
  });

  await t.step("should map camelCase fields from the response", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
    const entry = e._unsafeUnwrap().find((timeEntry) => timeEntry.id === 3);
    expect(entry !== undefined).toBe(true);
    expect(entry!.project).toEqual({ id: 1, name: "Demo" });
    expect(entry!.issue).toEqual({ id: 5 });
    expect(entry!.activity).toEqual({ id: 9, name: "Development" });
    expect(entry!.hours).toEqual(2.5);

    const entryWithoutIssue = e._unsafeUnwrap().find((timeEntry) =>
      timeEntry.id === 2
    );
    expect(entryWithoutIssue !== undefined).toBe(true);
    expect(entryWithoutIssue!.issue).toEqual(undefined);
    expect(entryWithoutIssue!.comments).toEqual(undefined);
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
      expect(e.isOk()).toBe(true);
      expect(captured?.get("project_id")).toEqual("1");
      expect(captured?.get("user_id")).toEqual("2");
      expect(captured?.get("spent_on")).toEqual("2026-07-01");
      expect(captured?.get("from")).toEqual("2026-07-01");
      expect(captured?.get("to")).toEqual("2026-07-31");
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
      expect(e.isOk()).toBe(true);
      expect(captured?.has("project_id")).toEqual(false);
      expect(!captured?.toString().includes("undefined")).toBe(true);
    },
  );
});
