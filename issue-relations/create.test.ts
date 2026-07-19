import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /issues/:issue_id/relations.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(create(context, 1, {
        issueToId: 2,
        relationType: "relates",
      })).resolves.toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(create(context, 422, {
        issueToId: 2,
        relationType: "relates",
      })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(create(context, 404, {
      issueToId: 2,
      relationType: "relates",
    })).rejects.toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/issues/:id/relations.json`,
          async ({ request }) => {
            const body = await request.json() as { relation: typeof captured };
            captured = body.relation;
            return HttpResponse.json({});
          },
        ),
      );
      await create(context, 1, {
        issueToId: 2,
        relationType: "precedes",
        delay: 3,
      });
      expect(captured?.issue_to_id).toStrictEqual(2);
      expect(captured?.relation_type).toStrictEqual("precedes");
      expect(captured?.delay).toStrictEqual(3);
    },
  );
});
