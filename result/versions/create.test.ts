import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/versions.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(context, 1, { name: "v1.0" });
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await create(context, 422, { name: "v1.0" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await create(context, 404, { name: "v1.0" });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/projects/:id/versions.json`,
          async ({ request }) => {
            const body = await request.json() as { version: typeof captured };
            captured = body.version;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, 1, {
        name: "v1.0",
        status: "open",
        sharing: "none",
        dueDate: new Date("2026-08-01"),
        wikiPageTitle: "Roadmap",
      });
      assert(e.isOk());
      assertEquals(captured?.name, "v1.0");
      assertEquals(captured?.due_date, "2026-08-01");
      assertEquals(captured?.wiki_page_title, "Roadmap");
    },
  );
});
