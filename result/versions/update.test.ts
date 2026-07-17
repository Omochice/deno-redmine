import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /versions/:id.json", async (t) => {
  await t.step("if got 204, should be success", async () => {
    server.use(...validHandlers);
    const e = await update(context, 3, { name: "v1.1" });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await update(context, 422, { name: "v1.1" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await update(context, 404, { name: "v1.1" });
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/versions/:id.json`,
          async ({ request }) => {
            const body = await request.json() as { version: typeof captured };
            captured = body.version;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await update(context, 3, {
        dueDate: new Date("2026-09-01"),
        wikiPageTitle: "Plan",
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.due_date).toEqual("2026-09-01");
      expect(captured?.wiki_page_title).toEqual("Plan");
    },
  );
});
