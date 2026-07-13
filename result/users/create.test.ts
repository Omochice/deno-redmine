import { create } from "./create.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /users.json", async (t) => {
  await t.step(
    "if got 201, should be success",
    async () => {
      server.use(...validHandlers);
      const e = await create(context, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
      });
      assert(e.isOk());
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      const e = await create(c, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
      });
      assert(e.isErr());
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    const e = await create(c, {
      login: "jsmith",
      firstname: "John",
      lastname: "Smith",
      mail: "jsmith@example.com",
    });
    assert(e.isErr());
  });

  await t.step(
    "should send camelCase attributes as snake_case",
    async () => {
      let captured: Record<string, unknown> | undefined;
      server.use(
        http.post(
          `${context.endpoint}/users.json`,
          async ({ request }) => {
            const body = await request.json() as { user: typeof captured };
            captured = body.user;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await create(context, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
        authSourceId: 1,
        mailNotification: "only_my_events",
        mustChangePasswd: true,
        generatePassword: false,
      });
      assert(e.isOk());
      assertEquals(captured?.login, "jsmith");
      assertEquals(captured?.auth_source_id, 1);
      assertEquals(captured?.mail_notification, "only_my_events");
      assertEquals(captured?.must_change_passwd, true);
      assertEquals(captured?.generate_password, false);
    },
  );
});
