import { Context } from "../../context.ts";
import { fetchList } from "./list.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Return the list of trackers
   */
  list(): ReturnType<typeof fetchList> {
    return fetchList(this.#context);
  }
}
