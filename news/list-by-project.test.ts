import { listByProject } from "./list-by-project.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/news.json", async (t) => {
  await t.step("if got 200, should resolve", async () => {
    server.use(...validHandlers);
    const news = await listByProject(context, 1);
    expect(news).toBeDefined();
  });

  await t.step(
    "if got 200, should return news with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const news = await listByProject(context, 1);
      expect(news.length).toStrictEqual(2);
      expect(news[0]).toStrictEqual({
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
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      await expect(listByProject(context, 422)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    await expect(listByProject(context, 404)).rejects.toThrow();
  });
});
