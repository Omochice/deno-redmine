import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { show } from "../throwable/my-account/show.ts";
import { update } from "../throwable/my-account/update.ts";

Deno.test({
  name: "E2E: My Account API",
  fn: async (t) => {
    const initialAccount = await show(e2eContext);
    const originalFirstname = initialAccount.firstname;

    try {
      await t.step(
        "GET /my/account.json should return the authenticated user's account",
        async () => {
          const account = await show(e2eContext);
          // e2e/setup.ts authenticates as the "admin" user, so the account
          // returned here is always that user.
          expect(account.login).toStrictEqual("admin");
        },
      );

      await t.step(
        "PUT /my/account.json should update the account",
        async () => {
          await update(e2eContext, {
            firstname: "E2E Updated Firstname",
          });

          const account = await show(e2eContext);
          expect(account.firstname).toStrictEqual(
            "E2E Updated Firstname",
          );
        },
      );
    } finally {
      // Restore the original firstname so this test has no lasting side effects
      // on the seeded e2e user, even if a step above threw.
      await update(e2eContext, {
        firstname: originalFirstname,
      });
    }
  },
});
