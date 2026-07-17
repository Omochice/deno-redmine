import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /attachments/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 6243);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return an attachment with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 6243);
      expect(e.isOk()).toBe(true);
      const attachment = e._unsafeUnwrap();
      expect(attachment.id).toStrictEqual(6243);
      expect(attachment.filename).toStrictEqual("example.txt");
      expect(attachment.contentType).toStrictEqual("text/plain");
      expect(attachment.contentUrl).toStrictEqual(
        "http://redmine.example.com/attachments/download/6243/example.txt",
      );
      expect(attachment.thumbnailUrl).toStrictEqual(
        "http://redmine.example.com/attachments/thumbnail/6243",
      );
      expect(attachment.author).toStrictEqual({
        id: 1,
        name: "Redmine Admin",
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await show(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await show(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
