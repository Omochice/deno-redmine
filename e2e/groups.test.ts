import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/groups/list.ts";
import { show } from "../result/groups/show.ts";
import { create } from "../result/groups/create.ts";
import { update } from "../result/groups/update.ts";
import { deleteGroup } from "../result/groups/delete.ts";
import { addUser } from "../result/groups/add-user.ts";
import { removeUser } from "../result/groups/remove-user.ts";

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
      const result = await create(e2eContext, { name: groupName });
      expect(result.isOk()).toBe(true);
    });

    let groupId: number | undefined;
    await t.step("GET /groups.json should list the created group", async () => {
      const result = await fetchList(e2eContext);
      expect(result.isOk()).toBe(true);
      const created = result._unsafeUnwrap().find((g) => g.name === groupName);
      expect(created !== undefined).toBe(true);
      groupId = created!.id;
    });

    await t.step("GET /groups/:id.json should return the group", async () => {
      expect(groupId !== undefined).toBe(true);
      const result = await show(e2eContext, groupId!);
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().id).toEqual(groupId);
      expect(result._unsafeUnwrap().name).toEqual(groupName);
    });

    const updatedName = `${groupName} Updated`;
    await t.step("PUT /groups/:id.json should update the group", async () => {
      expect(groupId !== undefined).toBe(true);
      const result = await update(e2eContext, groupId!, { name: updatedName });
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, groupId!);
      expect(showResult.isOk()).toBe(true);
      expect(showResult._unsafeUnwrap().name).toEqual(updatedName);
    });

    await t.step(
      "POST /groups/:id/users.json should add the current user",
      async () => {
        expect(groupId !== undefined).toBe(true);
        const userId = await currentUserId();
        // Skip gracefully when the current user cannot be resolved.
        if (userId === undefined) {
          return;
        }
        const addResult = await addUser(e2eContext, groupId!, userId);
        expect(addResult.isOk()).toBe(true);

        const removeResult = await removeUser(e2eContext, groupId!, userId);
        expect(removeResult.isOk()).toBe(true);
      },
    );

    await t.step(
      "DELETE /groups/:id.json should delete the group",
      async () => {
        expect(groupId !== undefined).toBe(true);
        const result = await deleteGroup(e2eContext, groupId!);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, groupId!);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
