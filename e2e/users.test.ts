import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
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
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /users.json should return users",
      async () => {
        const result = await fetchList(e2eContext);
        assert(result.isOk());
        assert(result.value.length > 0);
        const created = result.value.find((u) => u.login === login);
        assert(created !== undefined);
      },
    );

    await t.step("GET /users/:id.json should return a user", async () => {
      const listResult = await fetchList(e2eContext);
      assert(listResult.isOk());
      const user = listResult.value.find((u) => u.login === login);
      assert(user !== undefined);

      const result = await show(e2eContext, user.id);
      assert(result.isOk());
      assertEquals(result.value.id, user.id);
      assertEquals(result.value.login, login);
      assertEquals(result.value.firstname, "E2E");
      assertEquals(result.value.lastname, "Created");
      assertEquals(result.value.mail, mail);
    });

    await t.step("PUT /users/:id.json should update a user", async () => {
      const listResult = await fetchList(e2eContext);
      assert(listResult.isOk());
      const user = listResult.value.find((u) => u.login === login);
      assert(user !== undefined);

      const result = await update(e2eContext, user.id, {
        firstname: "E2E",
        lastname: "Updated",
      });
      assert(result.isOk());

      const showResult = await show(e2eContext, user.id);
      assert(showResult.isOk());
      assertEquals(showResult.value.lastname, "Updated");
    });

    await t.step(
      "DELETE /users/:id.json should delete a user",
      async () => {
        const listResult = await fetchList(e2eContext);
        assert(listResult.isOk());
        const user = listResult.value.find((u) => u.login === login);
        assert(user !== undefined);

        const result = await deleteUser(e2eContext, user.id);
        assert(result.isOk());

        const showResult = await show(e2eContext, user.id);
        assert(showResult.isErr());
      },
    );
  },
});
