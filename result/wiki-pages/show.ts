import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import { show as showWithError } from "../../throwable/wiki-pages/show.ts";

/**
 * Show the wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param title Title for wiki page
 * @returns Wiki page object
 */
export const show = ResultAsync.fromThrowable(
  showWithError,
  convertError("unknown error show a wiki page"),
);
