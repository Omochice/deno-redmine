import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchList as throwableFetchList } from "../../throwable/custom-fields/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch custom fields
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has custom fields or error
 */
export const fetchList = ResultAsync.fromThrowable(
  throwableFetchList,
  convertError("unknown error fetching custom fields"),
);
