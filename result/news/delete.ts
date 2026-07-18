import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteNews as deleteWithError } from "../../throwable/news/delete.ts";
import { convertError } from "../../error.ts";

/**
 * Delete the news of given id
 *
 * @param context REST endpoint context
 * @return Promise of result-type which is void or error
 */
export const deleteNews = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a news"),
);
