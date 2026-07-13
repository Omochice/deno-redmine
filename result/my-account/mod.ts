import type { Context } from "../../context.ts";
import { show } from "./show.ts";
import type { UpdateMyAccountQuery } from "../../throwable/my-account/type.ts";
import { update } from "./update.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns the authenticated user's account.
   */
  show(): ReturnType<typeof show> {
    return show(this.#context);
  }

  /**
   * Updates the authenticated user's account.
   *
   * @param account The account attributes to update it
   */
  update(
    account: UpdateMyAccountQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, account);
  }
}
