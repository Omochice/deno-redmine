import { fetchList } from "./list.ts";
import { expect } from "jsr:@std/expect@1.0.20";

import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /custom_fields.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await fetchList(context);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return custom fields with camelCase fields",
    async () => {
      server.resetHandlers(...validHandlers);
      const e = await fetchList(context);
      expect(e.isOk()).toBe(true);
      const customFields = e._unsafeUnwrap();
      expect(customFields.length).toStrictEqual(3);
      expect(customFields[0]).toStrictEqual({
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
      expect(customFields[1]).toStrictEqual({
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
      expect(customFields[2].possibleValues).toStrictEqual([
        { value: "a" },
        { value: "b" },
      ]);
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(...invalidHandlers);
      const e = await fetchList(context);
      expect(e.isErr()).toBe(true);
    },
  );
});
