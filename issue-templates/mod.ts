import type { Context } from "../context.ts";
import { list } from "./list.ts";
import type { ProjectRef } from "../projects/type.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Fetch list of issue templates
   * @params projectId Project id or Project identifier
   */
  list(projectId: ProjectRef): ReturnType<typeof list> {
    return list(this.#context, projectId);
  }
}
