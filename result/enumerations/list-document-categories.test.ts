import { listDocumentCategories } from "./list.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /enumerations/document_categories.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listDocumentCategories(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return document categories with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await listDocumentCategories(context);
      expect(e.isOk()).toBe(true);
      expect(e._unsafeUnwrap().length).toStrictEqual(2);
      expect(e._unsafeUnwrap()[0]).toStrictEqual({
        id: 1,
        name: "User documentation",
        isDefault: false,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await listDocumentCategories(context);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await listDocumentCategories(context);
    expect(e.isErr()).toBe(true);
  });
});
