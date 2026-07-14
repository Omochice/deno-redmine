import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchList as throwableFetchList } from "../../throwable/queries/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch queries
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has query or error
 */
export const fetchList = ResultAsync.fromThrowable(
  throwableFetchList,
  convertError("Unexpected error"),
);
