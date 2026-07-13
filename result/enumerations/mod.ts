import type { Context } from "../../context.ts";
import {
  listDocumentCategories,
  listIssuePriorities,
  listTimeEntryActivities,
} from "./list.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Return the list of issue priorities
   */
  listIssuePriorities(): ReturnType<typeof listIssuePriorities> {
    return listIssuePriorities(this.#context);
  }

  /**
   * Return the list of time entry activities
   */
  listTimeEntryActivities(): ReturnType<typeof listTimeEntryActivities> {
    return listTimeEntryActivities(this.#context);
  }

  /**
   * Return the list of document categories
   */
  listDocumentCategories(): ReturnType<typeof listDocumentCategories> {
    return listDocumentCategories(this.#context);
  }
}
