import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import { deleteWiki as deleteWikiWithError } from "../../throwable/wiki-pages/delete.ts";

/**
 * Delete a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param title Title for wiki page
 */
export const deleteWiki = ResultAsync.fromThrowable(
  deleteWikiWithError,
  convertError("unknown error delete a wiki page"),
);
