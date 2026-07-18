import { ResultAsync } from "npm:neverthrow@8.2.0";
import { update as updateWithError } from "../../throwable/news/update.ts";
import { convertError } from "../../error.ts";

/**
 * Update the news of given id
 *
 * @param context REST endpoint context
 * @return Promise of result-type which is void or error
 */
export const update = ResultAsync.fromThrowable(
  updateWithError,
  convertError("unknown error update a news"),
);
