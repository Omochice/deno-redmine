import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../users/list.ts";
import { show } from "../users/show.ts";
import { create } from "../users/create.ts";
import { update } from "../users/update.ts";
import { deleteUser } from "../users/delete.ts";

Deno.test({
  name: "E2E: Users API",
  fn: async (t) => {
    // Unique per run so repeated E2E executions never collide on login/mail.
    const unique = Date.now();
    const login = `e2e-user-${unique}`;
    const mail = `e2e-user-${unique}@example.com`;

    await t.step(
      "POST /users.json should create a user",
      async () => {
        await create(e2eContext, {
          login,
          firstname: "E2E",
          lastname: "Created",
          mail,
          password: "SuperSecret123!",
          generatePassword: false,
        });
      },
    );

    await t.step(
      "GET /users.json should return users",
      async () => {
        const users = await fetchList(e2eContext);
        expect(users.length).toBeGreaterThan(0);
        const created = users.find((u) => u.login === login);
        expect(created).toBeDefined();
      },
    );

    await t.step("GET /users/:id.json should return a user", async () => {
      const users = await fetchList(e2eContext);
      const user = users.find((u) => u.login === login);
      expect(user).toBeDefined();

      const shown = await show(e2eContext, user!.id);
      expect(shown.id).toStrictEqual(user!.id);
      expect(shown.login).toStrictEqual(login);
      expect(shown.firstname).toStrictEqual("E2E");
      expect(shown.lastname).toStrictEqual("Created");
      expect(shown.mail).toStrictEqual(mail);
    });

    await t.step("PUT /users/:id.json should update a user", async () => {
      const users = await fetchList(e2eContext);
      const user = users.find((u) => u.login === login);
      expect(user).toBeDefined();

      await update(e2eContext, user!.id, {
        firstname: "E2E",
        lastname: "Updated",
      });

      const shown = await show(e2eContext, user!.id);
      expect(shown.lastname).toStrictEqual("Updated");
    });

    await t.step(
      "DELETE /users/:id.json should delete a user",
      async () => {
        const users = await fetchList(e2eContext);
        const user = users.find((u) => u.login === login);
        expect(user).toBeDefined();

        await deleteUser(e2eContext, user!.id);

        await expect(show(e2eContext, user!.id)).rejects.toThrow();
      },
    );
  },
});
