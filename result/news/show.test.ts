import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /news/:id.json", async (t) => {
  await t.step(
    "if got 200, should return news with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await show(context, 1);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap()).toStrictEqual({
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
    "should include attachments and comments when requested",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await show(context, 1, ["attachments", "comments"]);
      expect(e.isOk()).toBe(true);
      const news = e._unsafeUnwrap();
      expect(news.attachments).toStrictEqual([
        {
          id: 7,
          filename: "note.txt",
          filesize: 12,
          contentType: "text/plain",
          description: "attached note",
          contentUrl:
            "http://redmine.example.com/attachments/download/7/note.txt",
          author: { id: 2, name: "John Smith" },
          createdOn: new Date("2026-07-13T00:00:00.000Z"),
        },
      ]);
      expect(news.comments).toStrictEqual([
        { id: 11, author: { id: 3, name: "Jane Doe" }, content: "Nice news" },
      ]);
    },
  );

  await t.step("if got 404, should be err", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await show(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
