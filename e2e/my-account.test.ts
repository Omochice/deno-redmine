import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { show } from "../result/my-account/show.ts";
import { update } from "../result/my-account/update.ts";

Deno.test({
  name: "E2E: My Account API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    const initialResult = await show(e2eContext);
    assert(initialResult.isOk());
    const originalFirstname = initialResult.value.firstname;

    await t.step(
      "GET /my/account.json should return the authenticated user's account",
      async () => {
        const result = await show(e2eContext);
        assert(result.isOk());
        assert(typeof result.value.login === "string");
        assert(typeof result.value.mail === "string");
      },
    );

    await t.step(
      "PUT /my/account.json should update the account",
      async () => {
        const result = await update(e2eContext, {
          firstname: "E2E Updated Firstname",
        });
        assert(result.isOk());

        const showResult = await show(e2eContext);
        assert(showResult.isOk());
        assertEquals(showResult.value.firstname, "E2E Updated Firstname");
      },
    );

    // Restore the original firstname so this test has no lasting side
    // effects on the seeded e2e user.
    const restoreResult = await update(e2eContext, {
      firstname: originalFirstname,
    });
    assert(restoreResult.isOk());
  },
});
