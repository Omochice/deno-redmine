import { ResultAsync } from "npm:neverthrow@8.2.0";
import { removeWatcher as throwableRemoveWatcher } from "../../throwable/issues/remove-watcher.ts";
import { convertError } from "../../error.ts";

/**
 * Removes a watcher from the issue of given id.
 *
 * @param context REST endpoint context
 * @param issueId The issue id
 * @param userId The id of the user to remove from watchers
 */
export const removeWatcher = ResultAsync.fromThrowable(
  throwableRemoveWatcher,
  convertError("unknown error remove a watcher"),
);
