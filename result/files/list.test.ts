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
      expect(e._unsafeUnwrap().length).toEqual(2);
      expect(e._unsafeUnwrap()[0].contentType).toEqual("application/zip");
      expect(e._unsafeUnwrap()[0].contentUrl).toEqual(
        "http://redmine.example.com/attachments/download/12/foo.zip",
      );
      expect(e._unsafeUnwrap()[0].version).toEqual({ id: 3, name: "v1.0" });
      expect(e._unsafeUnwrap()[0].createdOn).toEqual(
        new Date("2026-07-13T00:00:00.000Z"),
      );
      expect(e._unsafeUnwrap()[1].description).toEqual(undefined);
      expect(e._unsafeUnwrap()[1].version).toEqual(undefined);
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
