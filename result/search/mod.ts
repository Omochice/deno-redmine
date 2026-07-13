import type { Context } from "../../context.ts";
import { search } from "./search.ts";
import type { SearchQuery } from "../../throwable/search/type.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Searches across the resources indexed by Redmine.
   *
   * @param query The search query, whose only required field is `q`
   */
  search(query: SearchQuery): ReturnType<typeof search> {
    return search(this.#context, query);
  }
}
