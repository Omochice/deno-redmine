import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteVersion as deleteWithError } from "../../throwable/versions/delete.ts";
import { convertError } from "../../error.ts";

export const deleteVersion = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a version"),
);
