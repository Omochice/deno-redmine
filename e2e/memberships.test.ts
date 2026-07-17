import { expect } from "jsr:@std/expect@1.0.20";
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
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project !== undefined).toBe(true);

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
        const result = await create(e2eContext, project!.id, {
          userId,
          roleIds: [roleId],
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /projects/:project_id/memberships.json should return memberships",
      async () => {
        const result = await fetchList(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length > 0).toBe(true);
        const created = result._unsafeUnwrap().find((m) =>
          m.user?.id === userId
        );
        expect(created !== undefined).toBe(true);
        membershipId = created!.id;
      },
    );

    await t.step(
      "GET /memberships/:id.json should return a membership",
      async () => {
        const result = await show(e2eContext, membershipId);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().id).toEqual(membershipId);
        expect(result._unsafeUnwrap().project !== undefined).toBe(true);
        expect(result._unsafeUnwrap().roles.some((role) => role.id === roleId))
          .toBe(
            true,
          );
      },
    );

    await t.step(
      "PUT /memberships/:id.json should update a membership's roles",
      async () => {
        const result = await update(e2eContext, membershipId, {
          roleIds: [roleId],
        });
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, membershipId);
        expect(showResult.isOk()).toBe(true);
        expect(
          showResult._unsafeUnwrap().roles.some((role) => role.id === roleId),
        ).toBe(
          true,
        );
      },
    );

    await t.step(
      "DELETE /memberships/:id.json should delete a membership",
      async () => {
        const result = await deleteMembership(e2eContext, membershipId);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, membershipId);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
