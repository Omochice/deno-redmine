import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteRelation as deleteWithError } from "../../throwable/issue-relations/delete.ts";
import { convertError } from "../../error.ts";

export const deleteRelation = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a relation"),
);
