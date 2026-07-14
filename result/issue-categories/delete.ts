import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteIssueCategory as deleteWithError } from "../../throwable/issue-categories/delete.ts";
import { convertError } from "../../error.ts";

export const deleteIssueCategory = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete an issue category"),
);
