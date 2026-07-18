import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/roles/list.ts";
import { show } from "../result/roles/show.ts";

Deno.test({
  name: "E2E: Roles API",
  fn: async (t) => {
    await t.step(
      "GET /roles.json should return a list of roles",
      async () => {
        const result = await fetchList(e2eContext);
        expect(result.isOk()).toBe(true);
        expect(Array.isArray(result._unsafeUnwrap())).toBe(true);
      },
    );

    await t.step(
      "GET /roles/:id.json should return a role",
      async () => {
        const listResult = await fetchList(e2eContext);
        expect(listResult.isOk()).toBe(true);
        const role = listResult._unsafeUnwrap()[0];
        // e2e/setup.ts seeds a role so this normally runs. A freshly
        // provisioned Redmine loads no default roles, so guard the listing
        // being empty, but surface it rather than passing silently.
        if (role === undefined) {
          console.warn("No roles available; skipping the role show assertions");
          return;
        }

        const result = await show(e2eContext, role.id);
        expect(result.isOk()).toBe(true);
        const shown = result._unsafeUnwrap();
        expect(shown.id).toBe(role.id);
        expect(shown.name).toBe(role.name);
        expect(Array.isArray(shown.permissions)).toBe(true);
      },
    );
  },
});
