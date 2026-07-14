import { ResultAsync } from "npm:neverthrow@8.2.0";
import { removeUser as removeUserWithError } from "../../throwable/groups/remove-user.ts";
import { convertError } from "../../error.ts";

export const removeUser = ResultAsync.fromThrowable(
  removeUserWithError,
  convertError("unknown error remove a user from a group"),
);
