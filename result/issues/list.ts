import { ResultAsync } from "npm:neverthrow@8.2.0";
import { listIssues as throwableListIssues } from "../../throwable/issues/list.ts";
import { convertError } from "../../error.ts";

export const listIssues = ResultAsync.fromThrowable(
  throwableListIssues,
  convertError("unknown error list issues"),
);
