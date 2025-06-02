import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import { fetchList as fetchListWithError } from "../../throwable/wiki-pages/list.ts";

/**
 * List wiki pages included in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @returns Wiki pages
 */
export const fetchList = ResultAsync.fromThrowable(
  fetchListWithError,
  convertError("unknown error fetching wiki pages"),
);
