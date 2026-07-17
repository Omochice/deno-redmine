import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/users/list.ts";
import { show } from "../result/users/show.ts";
import { create } from "../result/users/create.ts";
import { update } from "../result/users/update.ts";
import { deleteUser } from "../result/users/delete.ts";

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
        const result = await create(e2eContext, {
          login,
          firstname: "E2E",
          lastname: "Created",
          mail,
          password: "SuperSecret123!",
          generatePassword: false,
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /users.json should return users",
      async () => {
        const result = await fetchList(e2eContext);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length).toBeGreaterThan(0);
        const created = result._unsafeUnwrap().find((u) => u.login === login);
        expect(created).toBeDefined();
      },
    );

    await t.step("GET /users/:id.json should return a user", async () => {
      const listResult = await fetchList(e2eContext);
      expect(listResult.isOk()).toBe(true);
      const user = listResult._unsafeUnwrap().find((u) => u.login === login);
      expect(user).toBeDefined();

      const result = await show(e2eContext, user!.id);
      expect(result.isOk()).toBe(true);
      const shown = result._unsafeUnwrap();
      expect(shown.id).toStrictEqual(user!.id);
      expect(shown.login).toStrictEqual(login);
      expect(shown.firstname).toStrictEqual("E2E");
      expect(shown.lastname).toStrictEqual("Created");
      expect(shown.mail).toStrictEqual(mail);
    });

    await t.step("PUT /users/:id.json should update a user", async () => {
      const listResult = await fetchList(e2eContext);
      expect(listResult.isOk()).toBe(true);
      const user = listResult._unsafeUnwrap().find((u) => u.login === login);
      expect(user).toBeDefined();

      const result = await update(e2eContext, user!.id, {
        firstname: "E2E",
        lastname: "Updated",
      });
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, user!.id);
      expect(showResult.isOk()).toBe(true);
      expect(showResult._unsafeUnwrap().lastname).toStrictEqual("Updated");
    });

    await t.step(
      "DELETE /users/:id.json should delete a user",
      async () => {
        const listResult = await fetchList(e2eContext);
        expect(listResult.isOk()).toBe(true);
        const user = listResult._unsafeUnwrap().find((u) => u.login === login);
        expect(user).toBeDefined();

        const result = await deleteUser(e2eContext, user!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, user!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
