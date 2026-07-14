import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchListByProject as throwableFetchListByProject } from "../../throwable/news/list-by-project.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch news of the given project
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has news or error
 */
export const fetchListByProject = ResultAsync.fromThrowable(
  throwableFetchListByProject,
  convertError("unknown error fetching news"),
);
