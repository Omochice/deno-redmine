import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects.json", async (t) => {
  await t.step(
    "if got 200, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(
        context,
        { name: "sample", identifier: "sample" },
      );
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create(c, { name: "sample", identifier: "sample" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/422` };
    const e = await create(c, { name: "sample", identifier: "sample" });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(`${context.endpoint}/projects.json`, async ({ request }) => {
          const body = await request.json() as { project: typeof captured };
          captured = body.project;
          return HttpResponse.json({});
        }),
      );
      const e = await create(context, {
        name: "sample",
        identifier: "sample",
        isPublic: false,
        parentId: 42,
        inheritMembers: true,
      });
      assert(e.isOk());
      assertEquals(captured?.is_public, false);
      assertEquals(captured?.parent_id, 42);
      assertEquals(captured?.inherit_members, true);
    },
  );

  await t.step(
    "should accept a name containing spaces",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(`${context.endpoint}/projects.json`, async ({ request }) => {
          const body = await request.json() as { project: typeof captured };
          captured = body.project;
          return HttpResponse.json({});
        }),
      );
      const e = await create(context, {
        name: "My Project",
        identifier: "my-project",
      });
      assert(e.isOk());
      assertEquals(captured?.name, "My Project");
    },
  );
});
