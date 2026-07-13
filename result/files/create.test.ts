import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/files.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(context, 1, { token: "abc" });
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await create(context, 422, { token: "abc" });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await create(context, 404, { token: "abc" });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/projects/:id/files.json`,
          async ({ request }) => {
            const body = await request.json() as { file: typeof captured };
            captured = body.file;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, 1, {
        token: "abc",
        versionId: 3,
        filename: "foo.zip",
        description: "A dummy attachment",
      });
      assert(e.isOk());
      assertEquals(captured?.token, "abc");
      assertEquals(captured?.version_id, 3);
      assertEquals(captured?.filename, "foo.zip");
      assertEquals(captured?.description, "A dummy attachment");
    },
  );
});
