import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects/:project_id/files.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(create(context, 1, { token: "abc" })).resolves
        .toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(create(context, 422, { token: "abc" })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(create(context, 404, { token: "abc" })).rejects.toThrow();
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
      await create(context, 1, {
        token: "abc",
        versionId: 3,
        filename: "foo.zip",
        description: "A dummy attachment",
      });
      expect(captured?.token).toStrictEqual("abc");
      expect(captured?.version_id).toStrictEqual(3);
      expect(captured?.filename).toStrictEqual("foo.zip");
      expect(captured?.description).toStrictEqual("A dummy attachment");
    },
  );
});
