import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteIssue as deleteWithError } from "../../throwable/issues/delete.ts";
import { convertError } from "../../error.ts";

export const deleteIssue = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete an issue"),
);
