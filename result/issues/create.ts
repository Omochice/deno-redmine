import { ResultAsync } from "npm:neverthrow@8.2.0";
import { createIssue as throwableCreateIssue } from "../../throwable/issues/create.ts";
import { convertError } from "../../error.ts";

/**
 * Create issue
 *
 * @param context REST endpoint context
 * @return Promise of result-type
 */
export const createIssue = ResultAsync.fromThrowable(
  throwableCreateIssue,
  convertError("uunknown error create an issue"),
);
