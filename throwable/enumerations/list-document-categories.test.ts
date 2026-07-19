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
  await t.step("if got 200, should resolve", async () => {
    server.resetHandlers(...validHandlers);
    const categories = await listDocumentCategories(context);
    expect(categories).toBeDefined();
  });

  await t.step(
    "if got 200, should return document categories with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const categories = await listDocumentCategories(context);
      expect(categories.length).toStrictEqual(2);
      expect(categories[0]).toStrictEqual({
        id: 1,
        name: "User documentation",
        isDefault: false,
        active: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.resetHandlers(...invalidHandlers);
      await expect(listDocumentCategories(context)).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    await expect(listDocumentCategories(context)).rejects.toThrow();
  });
});
