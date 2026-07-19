import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../throwable/groups/list.ts";
import { show } from "../throwable/groups/show.ts";
import { create } from "../throwable/groups/create.ts";
import { update } from "../throwable/groups/update.ts";
import { deleteGroup } from "../throwable/groups/delete.ts";
import { addUser } from "../throwable/groups/add-user.ts";
import { removeUser } from "../throwable/groups/remove-user.ts";

async function currentUserId(): Promise<number | undefined> {
  const response = await fetch(
    new URL("/users/current.json", e2eContext.endpoint),
    {
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": e2eContext.apiKey,
      },
    },
  );
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const body = await response.json() as { user?: { id?: number } };
  return body.user?.id;
}

Deno.test({
  name: "E2E: Groups API",
  fn: async (t) => {
    // A unique name avoids clashing with groups left over from prior runs.
    const groupName = `E2E Group ${Date.now()}`;

    await t.step("POST /groups.json should create a group", async () => {
      await create(e2eContext, { name: groupName });
    });

    let groupId: number | undefined;
    await t.step("GET /groups.json should list the created group", async () => {
      const groups = await fetchList(e2eContext);
      const created = groups.find((g) => g.name === groupName);
      expect(created).toBeDefined();
      groupId = created!.id;
    });

    await t.step("GET /groups/:id.json should return the group", async () => {
      expect(groupId).toBeDefined();
      const group = await show(e2eContext, groupId!);
      expect(group.id).toStrictEqual(groupId);
      expect(group.name).toStrictEqual(groupName);
    });

    const updatedName = `${groupName} Updated`;
    await t.step("PUT /groups/:id.json should update the group", async () => {
      expect(groupId).toBeDefined();
      await update(e2eContext, groupId!, { name: updatedName });

      const group = await show(e2eContext, groupId!);
      expect(group.name).toStrictEqual(updatedName);
    });

    await t.step(
      "POST /groups/:id/users.json should add the current user",
      async () => {
        expect(groupId).toBeDefined();
        const userId = await currentUserId();
        // Skip gracefully when the current user cannot be resolved.
        if (userId === undefined) {
          return;
        }
        await addUser(e2eContext, groupId!, userId);
        await removeUser(e2eContext, groupId!, userId);
      },
    );

    await t.step(
      "DELETE /groups/:id.json should delete the group",
      async () => {
        expect(groupId).toBeDefined();
        await deleteGroup(e2eContext, groupId!);

        await expect(show(e2eContext, groupId!)).rejects.toThrow();
      },
    );
  },
});
