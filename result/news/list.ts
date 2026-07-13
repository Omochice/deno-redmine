import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchList as throwableFetchList } from "../../throwable/news/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch news across all projects
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has news or error
 */
export const fetchList = ResultAsync.fromThrowable(
  throwableFetchList,
  convertError("unknown error fetching news"),
);
