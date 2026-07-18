import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/files.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context, 1);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return files with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context, 1);
      expect(e.isOk()).toBe(true);
      const files = e._unsafeUnwrap();
      expect(files.length).toStrictEqual(2);
      expect(files[0].contentType).toStrictEqual("application/zip");
      expect(files[0].contentUrl).toStrictEqual(
        "http://redmine.example.com/attachments/download/12/foo.zip",
      );
      expect(files[0].version).toStrictEqual({ id: 3, name: "v1.0" });
      expect(files[0].createdOn).toStrictEqual(
        new Date("2026-07-13T00:00:00.000Z"),
      );
      expect(files[1].description).toBeUndefined();
      expect(files[1].version).toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await fetchList(context, 404);
    expect(e.isErr()).toBe(true);
  });
});
