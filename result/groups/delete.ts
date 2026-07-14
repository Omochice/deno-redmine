import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteGroup as deleteWithError } from "../../throwable/groups/delete.ts";
import { convertError } from "../../error.ts";

export const deleteGroup = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a group"),
);
