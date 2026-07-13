import { ResultAsync } from "npm:neverthrow@8.2.0";
import { addWatcher as throwableAddWatcher } from "../../throwable/issues/add-watcher.ts";
import { convertError } from "../../error.ts";

/**
 * Adds a watcher to the issue of given id.
 *
 * @param context REST endpoint context
 * @param issueId The issue id
 * @param userId The id of the user to add as a watcher
 */
export const addWatcher = ResultAsync.fromThrowable(
  throwableAddWatcher,
  convertError("unknown error add a watcher"),
);
