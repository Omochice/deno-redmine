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
      expect(e._unsafeUnwrap().id).toEqual(6243);
      expect(e._unsafeUnwrap().filename).toEqual("example.txt");
      expect(e._unsafeUnwrap().contentType).toEqual("text/plain");
      expect(e._unsafeUnwrap().contentUrl).toEqual(
        "http://redmine.example.com/attachments/download/6243/example.txt",
      );
      expect(e._unsafeUnwrap().thumbnailUrl).toEqual(
        "http://redmine.example.com/attachments/thumbnail/6243",
      );
      expect(e._unsafeUnwrap().author).toEqual({
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
