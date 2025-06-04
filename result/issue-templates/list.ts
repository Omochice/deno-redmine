import { ResultAsync } from "npm:neverthrow@8.2.0";
import { list as throwableList } from "../../throwable/issue-templates/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch list of issue templates
 * @params context Connection context object
 * @params projectId Project id or Project identifier
 */
export const list = ResultAsync.fromThrowable(
  throwableList,
  convertError("unknown error fetching issue templates list"),
);
