import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteTimeEntry as deleteWithError } from "../../throwable/time-entries/delete.ts";
import { convertError } from "../../error.ts";

export const deleteTimeEntry = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a time entry"),
);
