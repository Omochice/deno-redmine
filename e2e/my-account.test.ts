import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { show } from "../result/my-account/show.ts";
import { update } from "../result/my-account/update.ts";

Deno.test({
  name: "E2E: My Account API",
  fn: async (t) => {
    const initialResult = await show(e2eContext);
    expect(initialResult.isOk()).toBe(true);
    const originalFirstname = initialResult._unsafeUnwrap().firstname;

    try {
      await t.step(
        "GET /my/account.json should return the authenticated user's account",
        async () => {
          const result = await show(e2eContext);
          expect(result.isOk()).toBe(true);
          // e2e/setup.ts authenticates as the "admin" user, so the account
          // returned here is always that user.
          expect(result._unsafeUnwrap().login).toEqual("admin");
        },
      );

      await t.step(
        "PUT /my/account.json should update the account",
        async () => {
          const result = await update(e2eContext, {
            firstname: "E2E Updated Firstname",
          });
          expect(result.isOk()).toBe(true);

          const showResult = await show(e2eContext);
          expect(showResult.isOk()).toBe(true);
          expect(showResult._unsafeUnwrap().firstname).toEqual(
            "E2E Updated Firstname",
          );
        },
      );
    } finally {
      // Restore the original firstname so this test has no lasting side effects
      // on the seeded e2e user, even if a step above threw.
      const restoreResult = await update(e2eContext, {
        firstname: originalFirstname,
      });
      expect(restoreResult.isOk()).toBe(true);
    }
  },
});
