import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchList as throwableFetchList } from "../../throwable/issue-statuses/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch issue statuses
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has issue statuses or error
 */
export const fetchList = ResultAsync.fromThrowable(
  throwableFetchList,
  convertError("Unexpected error"),
);
