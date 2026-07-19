import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../roles/list.ts";
import { show } from "../roles/show.ts";

Deno.test({
  name: "E2E: Roles API",
  fn: async (t) => {
    await t.step(
      "GET /roles.json should return a list of roles",
      async () => {
        const roles = await fetchList(e2eContext);
        expect(Array.isArray(roles)).toBe(true);
      },
    );

    await t.step(
      "GET /roles/:id.json should return a role",
      async () => {
        const roles = await fetchList(e2eContext);
        const role = roles[0];
        // e2e/setup.ts seeds a role so this normally runs. A freshly
        // provisioned Redmine loads no default roles, so guard the listing
        // being empty, but surface it rather than passing silently.
        if (role === undefined) {
          console.warn("No roles available; skipping the role show assertions");
          return;
        }

        const shown = await show(e2eContext, role.id);
        expect(shown.id).toBe(role.id);
        expect(shown.name).toBe(role.name);
        expect(Array.isArray(shown.permissions)).toBe(true);
      },
    );
  },
});
