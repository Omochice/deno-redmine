import { fetchList } from "./list.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /custom_fields.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    assert(e.isOk());
  });

  await t.step(
    "if got 200, should return custom fields with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      assert(e.isOk());
      assertEquals(e.value.length, 2);
      assertEquals(e.value[0], {
        id: 1,
        name: "Affected version",
        customizedType: "issue",
        fieldFormat: "list",
        isRequired: true,
        isFilter: true,
        searchable: true,
        multiple: true,
        visible: false,
        possibleValues: [
          { value: "0.5.x", label: "v0.5.x" },
          // Redmine may send an explicit null label; it normalizes to undefined.
          { value: "0.6.x", label: undefined },
        ],
        trackers: [{ id: 1, name: "Bug" }],
        roles: [{ id: 3, name: "Manager" }],
      });
      assertEquals(e.value[1], {
        id: 2,
        name: "Database",
        customizedType: "project",
        fieldFormat: "string",
        // Sent as explicit `null` by Redmine in the mock response: the
        // validator maps them to `undefined`, and since the key was present
        // on input, it stays present (rather than omitted) on output.
        regexp: undefined,
        minLength: undefined,
        maxLength: undefined,
        defaultValue: undefined,
        isRequired: false,
        isFilter: false,
        searchable: false,
        multiple: false,
        visible: true,
      });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context);
      assert(e.isErr());
    },
  );
});
