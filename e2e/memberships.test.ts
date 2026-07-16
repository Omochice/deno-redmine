import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/memberships/list.ts";
import { show } from "../result/memberships/show.ts";
import { create } from "../result/memberships/create.ts";
import { update } from "../result/memberships/update.ts";
import { deleteMembership } from "../result/memberships/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

// The library has no `users`/`roles` resources yet, so these are fetched
// directly against the raw REST API, mirroring e2e/setup.ts's seeding
// helpers.
async function fetchCurrentUserId(): Promise<number | undefined> {
  const response = await fetch(`${e2eContext.endpoint}/users/current.json`, {
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": e2eContext.apiKey,
    },
  });
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const data = await response.json();
  return data.user?.id;
}

async function fetchFirstRoleId(): Promise<number | undefined> {
  const response = await fetch(`${e2eContext.endpoint}/roles.json`, {
    headers: {
      "Content-Type": "application/json",
      "X-Redmine-API-Key": e2eContext.apiKey,
    },
  });
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const data = await response.json();
  return data.roles?.[0]?.id;
}

Deno.test({
  name: "E2E: Memberships API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    const userId = await fetchCurrentUserId();
    const roleId = await fetchFirstRoleId();
    if (userId === undefined || roleId === undefined) {
      // Without an existing user and role the round trip cannot proceed;
      // skip rather than fail so a Redmine instance without a seeded admin
      // user or role does not break the suite.
      return;
    }

    let membershipId: number;

    await t.step(
      "POST /projects/:project_id/memberships.json should create a membership",
      async () => {
        const result = await create(e2eContext, project.id, {
          userId,
          roleIds: [roleId],
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /projects/:project_id/memberships.json should return memberships",
      async () => {
        const result = await fetchList(e2eContext, project.id);
        assert(result.isOk());
        assert(result.value.length > 0);
        const created = result.value.find((m) => m.user?.id === userId);
        assert(created !== undefined);
        membershipId = created.id;
      },
    );

    await t.step(
      "GET /memberships/:id.json should return a membership",
      async () => {
        const result = await show(e2eContext, membershipId);
        assert(result.isOk());
        assertEquals(result.value.id, membershipId);
        assert(result.value.project !== undefined);
        assert(result.value.roles.some((role) => role.id === roleId));
      },
    );

    await t.step(
      "PUT /memberships/:id.json should update a membership's roles",
      async () => {
        const result = await update(e2eContext, membershipId, {
          roleIds: [roleId],
        });
        assert(result.isOk());

        const showResult = await show(e2eContext, membershipId);
        assert(showResult.isOk());
        assert(showResult.value.roles.some((role) => role.id === roleId));
      },
    );

    await t.step(
      "DELETE /memberships/:id.json should delete a membership",
      async () => {
        const result = await deleteMembership(e2eContext, membershipId);
        assert(result.isOk());

        const showResult = await show(e2eContext, membershipId);
        assert(showResult.isErr());
      },
    );
  },
});
