import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
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
      expect(e.isOk()).toBe(true);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create(c, { name: "sample", identifier: "sample" });
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/422` };
    const e = await create(c, { name: "sample", identifier: "sample" });
    expect(e.isErr()).toBe(true);
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
        trackerIds: [1, 2],
      });
      expect(e.isOk()).toBe(true);
      expect(captured?.is_public).toEqual(false);
      expect(captured?.parent_id).toEqual(42);
      expect(captured?.inherit_members).toEqual(true);
      expect(captured?.tracker_ids).toEqual([1, 2]);
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
      expect(e.isOk()).toBe(true);
      expect(captured?.name).toEqual("My Project");
    },
  );
});
