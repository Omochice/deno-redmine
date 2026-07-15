import { fetchList } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/files.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context, 1);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return files with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context, 1);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[0].contentType, "application/zip");
      assertEquals(
        e.value[0].contentUrl,
        "http://redmine.example.com/attachments/download/12/foo.zip",
      );
      assertEquals(e.value[0].version, { id: 3, name: "v1.0" });
      assertEquals(e.value[0].createdOn, new Date("2026-07-13T00:00:00.000Z"));
      assertEquals(e.value[1].description, undefined);
      assertEquals(e.value[1].version, undefined);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context, 422);
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await fetchList(context, 404);
    assert(e.isErr());
  });
});
