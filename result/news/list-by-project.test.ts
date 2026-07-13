import { fetchListByProject } from "./list-by-project.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/news.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchListByProject(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return news with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchListByProject(context, 1);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[0], {
        id: 1,
        project: { id: 1, name: "Demo" },
        author: { id: 2, name: "John Smith" },
        title: "News title",
        summary: "News summary",
        description: "News description",
        createdOn: new Date("2026-07-13T00:00:00.000Z"),
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await fetchListByProject(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await fetchListByProject(context, 404);
    assert(e.isErr());
  });
});
