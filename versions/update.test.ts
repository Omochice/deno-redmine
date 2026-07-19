import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /versions/:id.json", async (t) => {
  await t.step("if got 204, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 3, { name: "v1.1" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { name: "v1.1" })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { name: "v1.1" })).rejects.toThrow();
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
      await update(context, 3, {
        dueDate: new Date("2026-09-01"),
        wikiPageTitle: "Plan",
      });
      expect(captured?.due_date).toStrictEqual("2026-09-01");
      expect(captured?.wiki_page_title).toStrictEqual("Plan");
    },
  );
});
