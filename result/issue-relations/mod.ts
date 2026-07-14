import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { show } from "./show.ts";
import { create } from "./create.ts";
import type { CreateRelationQuery } from "../../throwable/issue-relations/type.ts";
import { deleteRelation } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all relations of the issue.
   *
   * @param issueId Issue identifier
   */
  list(issueId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, issueId);
  }

  /**
   * Creates a relation from the issue.
   *
   * @param issueId Issue identifier
   * @param relation The relation attributes
   */
  create(
    issueId: number,
    relation: CreateRelationQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, issueId, relation);
  }

  /**
   * Returns the relation of given id.
   *
   * @param id Relation identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Deletes the relation of given id.
   *
   * @param id Relation identifier
   */
  delete(id: number): ReturnType<typeof deleteRelation> {
    return deleteRelation(this.#context, id);
  }
}
