import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import { update as updateWithError } from "../../throwable/wiki-pages/update.ts";

/**
 * Update a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param wiki Wiki page object
 */
export const update = ResultAsync.fromThrowable(
  updateWithError,
  convertError("unknown error update a wiki page"),
);
