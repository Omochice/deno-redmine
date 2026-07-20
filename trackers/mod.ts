import { Context } from "../context.ts";
import { list } from "./list.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Return the list of trackers
   */
  list(): ReturnType<typeof list> {
    return list(this.#context);
  }
}
