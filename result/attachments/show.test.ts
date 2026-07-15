import { show } from "./show.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /attachments/:id.json", async (t) => {
  await t.step("if got 200, should return ok", async () => {
    server.use(...validHandlers);
    const e = await show(context, 6243);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return an attachment with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await show(context, 6243);
      assert(e.isOk());
      assertEquals(e.value.id, 6243);
      assertEquals(e.value.filename, "example.txt");
      assertEquals(e.value.contentType, "text/plain");
      assertEquals(
        e.value.contentUrl,
        "http://redmine.example.com/attachments/download/6243/example.txt",
      );
      assertEquals(
        e.value.thumbnailUrl,
        "http://redmine.example.com/attachments/thumbnail/6243",
      );
      assertEquals(e.value.author, { id: 1, name: "Redmine Admin" });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await show(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await show(context, 404);
    assert(e.isErr());
  });
});
