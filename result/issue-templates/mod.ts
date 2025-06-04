import type { Context } from "../../context.ts";
import { list } from "./list.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Fetch list of issue templates
   * @params projectId Project id or Project identifier
   */
  list(projectId: number | string): ReturnType<typeof list> {
    return list(this.#context, projectId);
  }
}
