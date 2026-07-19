import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /time_entries.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const list = await fetchList(context);
    expect(list).toBeDefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      await expect(fetchList(c)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    await expect(fetchList(c)).rejects.toThrow();
  });

  await t.step("should map camelCase fields from the response", async () => {
    server.use(...validHandlers);
    const entries = await fetchList(context);
    const entry = entries.find((timeEntry) => timeEntry.id === 3);
    expect(entry).toBeDefined();
    expect(entry!.project).toStrictEqual({ id: 1, name: "Demo" });
    expect(entry!.issue).toStrictEqual({ id: 5 });
    expect(entry!.activity).toStrictEqual({ id: 9, name: "Development" });
    expect(entry!.hours).toStrictEqual(2.5);

    const entryWithoutIssue = entries.find((timeEntry) => timeEntry.id === 2);
    expect(entryWithoutIssue).toBeDefined();
    expect(entryWithoutIssue!.issue).toBeUndefined();
    expect(entryWithoutIssue!.comments).toBeUndefined();
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
      await fetchList(context, {
        projectId: 1,
        userId: 2,
        spentOn: new Date("2026-07-01"),
        from: new Date("2026-07-01"),
        to: new Date("2026-07-31"),
      });
      expect(captured?.get("project_id")).toStrictEqual("1");
      expect(captured?.get("user_id")).toStrictEqual("2");
      expect(captured?.get("spent_on")).toStrictEqual("2026-07-01");
      expect(captured?.get("from")).toStrictEqual("2026-07-01");
      expect(captured?.get("to")).toStrictEqual("2026-07-31");
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
      await fetchList(context, { projectId: undefined });
      expect(captured?.has("project_id")).toStrictEqual(false);
      expect(!captured?.toString().includes("undefined")).toBe(true);
    },
  );
});
