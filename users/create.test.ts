import { create } from "./create.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("POST /users.json", async (t) => {
  await t.step(
    "if got 201, should resolve",
    async () => {
      server.use(...validHandlers);
      await expect(create(context, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
      })).resolves.toBeUndefined();
    },
  );

  await t.step(
    "if get invalid response with error object, should throw",
    async () => {
      server.use(...invalidHandlers);
      const c = { ...context, endpoint: `${context.endpoint}/422` };
      await expect(create(c, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
      })).rejects.toThrow();
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const c = { ...context, endpoint: `${context.endpoint}/404` };
    await expect(create(c, {
      login: "jsmith",
      firstname: "John",
      lastname: "Smith",
      mail: "jsmith@example.com",
    })).rejects.toThrow();
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
      await create(context, {
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
        authSourceId: 1,
        mailNotification: "only_my_events",
        mustChangePasswd: true,
        generatePassword: false,
      });
      expect(captured?.login).toStrictEqual("jsmith");
      expect(captured?.auth_source_id).toStrictEqual(1);
      expect(captured?.mail_notification).toStrictEqual("only_my_events");
      expect(captured?.must_change_passwd).toStrictEqual(true);
      expect(captured?.generate_password).toStrictEqual(false);
    },
  );
});
