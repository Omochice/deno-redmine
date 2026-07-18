import { ResultAsync } from "npm:neverthrow@8.2.0";
import { show as showWithError } from "../../throwable/news/show.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch the news of given id
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has the news or error
 */
export const show = ResultAsync.fromThrowable(
  showWithError,
  convertError("unknown error show a news"),
);
