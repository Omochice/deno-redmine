import { update } from "./update.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@3.0.2";
import { setupServer } from "../_msw.ts";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("PUT /projects/:id.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    await expect(update(context, 1, { name: "sample" })).resolves
      .toBeUndefined();
  });

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(update(context, 422, { name: "sample" })).rejects
        .toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(update(context, 404, { name: "sample" })).rejects.toThrow();
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.put(
          `${context.endpoint}/projects/:id.json`,
          async ({ request }) => {
            const body = await request.json() as { project: typeof captured };
            captured = body.project;
            return HttpResponse.json({});
          },
        ),
      );
      await update(context, 1, { isPublic: false });
      expect(captured?.is_public).toStrictEqual(false);
    },
  );
});
