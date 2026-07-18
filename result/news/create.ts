import { ResultAsync } from "npm:neverthrow@8.2.0";
import { create as createWithError } from "../../throwable/news/create.ts";
import { convertError } from "../../error.ts";

/**
 * Create a news for the given project
 *
 * @param context REST endpoint context
 * @return Promise of result-type which is void or error
 */
export const create = ResultAsync.fromThrowable(
  createWithError,
  convertError("unknown error create a news"),
);
