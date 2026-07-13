import { ResultAsync } from "npm:neverthrow@8.2.0";
import {
  listDocumentCategories as listDocumentCategoriesWithError,
  listIssuePriorities as listIssuePrioritiesWithError,
  listTimeEntryActivities as listTimeEntryActivitiesWithError,
} from "../../throwable/enumerations/list.ts";
import { convertError } from "../../error.ts";

/**
 * Fetch issue priorities
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has issue priorities or error
 */
export const listIssuePriorities = ResultAsync.fromThrowable(
  listIssuePrioritiesWithError,
  convertError("unknown error fetching issue priorities"),
);

/**
 * Fetch time entry activities
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has time entry activities or error
 */
export const listTimeEntryActivities = ResultAsync.fromThrowable(
  listTimeEntryActivitiesWithError,
  convertError("unknown error fetching time entry activities"),
);

/**
 * Fetch document categories
 *
 * @param context REST endpoint context
 * @return Promise of result-type which has document categories or error
 */
export const listDocumentCategories = ResultAsync.fromThrowable(
  listDocumentCategoriesWithError,
  convertError("unknown error fetching document categories"),
);
