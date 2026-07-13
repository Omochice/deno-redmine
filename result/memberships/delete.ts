import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteMembership as deleteWithError } from "../../throwable/memberships/delete.ts";
import { convertError } from "../../error.ts";

export const deleteMembership = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a membership"),
);
