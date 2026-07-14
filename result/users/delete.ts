import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteUser as deleteWithError } from "../../throwable/users/delete.ts";
import { convertError } from "../../error.ts";

export const deleteUser = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a user"),
);
