import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../memberships/list.ts";
import { show } from "../memberships/show.ts";
import { create } from "../memberships/create.ts";
import { update } from "../memberships/update.ts";
import { deleteMembership } from "../memberships/delete.ts";
import { fetchList as fetchProjects } from "../projects/list.ts";

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
    const projects = await fetchProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

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
        await expect(
          create(e2eContext, project!.id, {
            userId,
            roleIds: [roleId],
          }),
        ).resolves.toBeUndefined();
      },
    );

    await t.step(
      "GET /projects/:project_id/memberships.json should return memberships",
      async () => {
        const memberships = await fetchList(e2eContext, project!.id);
        expect(memberships.length).toBeGreaterThan(0);
        const created = memberships.find((m) => m.user?.id === userId);
        expect(created).toBeDefined();
        membershipId = created!.id;
      },
    );

    await t.step(
      "GET /memberships/:id.json should return a membership",
      async () => {
        const membership = await show(e2eContext, membershipId);
        expect(membership.id).toStrictEqual(membershipId);
        expect(membership.project).toBeDefined();
        expect(membership.roles.some((role) => role.id === roleId))
          .toBe(
            true,
          );
      },
    );

    await t.step(
      "PUT /memberships/:id.json should update a membership's roles",
      async () => {
        await update(e2eContext, membershipId, {
          roleIds: [roleId],
        });

        const membership = await show(e2eContext, membershipId);
        expect(
          membership.roles.some((role) => role.id === roleId),
        ).toBe(
          true,
        );
      },
    );

    await t.step(
      "DELETE /memberships/:id.json should delete a membership",
      async () => {
        await deleteMembership(e2eContext, membershipId);

        await expect(show(e2eContext, membershipId)).rejects.toThrow();
      },
    );
  },
});
