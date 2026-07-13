import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/roles/list.ts";
import { show } from "../result/roles/show.ts";

Deno.test({
  name: "E2E: Roles API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    await t.step(
      "GET /roles.json should return default roles",
      async () => {
        const result = await fetchList(e2eContext);
        assert(result.isOk());
        assert(result.value.length > 0, "Redmine should have default roles");
        assert(typeof result.value[0].id === "number");
        assert(typeof result.value[0].name === "string");
      },
    );

    await t.step(
      "GET /roles/:id.json should return a role",
      async () => {
        const listResult = await fetchList(e2eContext);
        assert(listResult.isOk());
        const role = listResult.value[0];

        const result = await show(e2eContext, role.id);
        assert(result.isOk());
        assert(result.value.id === role.id);
        assert(result.value.name === role.name);
        assert(typeof result.value.assignable === "boolean");
        assert(typeof result.value.issuesVisibility === "string");
        assert(typeof result.value.timeEntriesVisibility === "string");
        assert(typeof result.value.usersVisibility === "string");
        assert(Array.isArray(result.value.permissions));
      },
    );
  },
});
