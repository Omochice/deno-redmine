import { ResultAsync } from "npm:neverthrow@8.2.0";
import { create as createWithError } from "../../throwable/wiki-pages/create.ts";
import { convertError } from "../../error.ts";

/**
 * Create a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param wiki Wiki page object
 */
export const create = ResultAsync.fromThrowable(
  createWithError,
  convertError("unknown error create a wiki page"),
);
