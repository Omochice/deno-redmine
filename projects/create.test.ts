import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /projects.json", async (t) => {
  await t.step(
    "if got 200, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(
        create(context, { name: "sample", identifier: "sample" }),
      ).resolves.toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      await expect(
        create(c, { name: "sample", identifier: "sample" }),
      ).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/422` };
    await expect(create(c, { name: "sample", identifier: "sample" }))
      .rejects.toThrow();
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
      await create(context, {
        name: "sample",
        identifier: "sample",
        isPublic: false,
        parentId: 42,
        inheritMembers: true,
        trackerIds: [1, 2],
      });
      expect(captured?.is_public).toStrictEqual(false);
      expect(captured?.parent_id).toStrictEqual(42);
      expect(captured?.inherit_members).toStrictEqual(true);
      expect(captured?.tracker_ids).toStrictEqual([1, 2]);
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
      await create(context, {
        name: "My Project",
        identifier: "my-project",
      });
      expect(captured?.name).toStrictEqual("My Project");
    },
  );
});
