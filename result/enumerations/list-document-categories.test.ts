import { listDocumentCategories } from "./list.ts";
import {
  context,
  invalidHandlers,
  notFoundHandlers,
  validHandlers,
} from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

const server = setupServer();
server.listen();

Deno.test("GET /enumerations/document_categories.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await listDocumentCategories(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return document categories with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await listDocumentCategories(context);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[0], {
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
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(...notFoundHandlers);
    const e = await listDocumentCategories(context);
    assert(e.isErr());
  });
});
