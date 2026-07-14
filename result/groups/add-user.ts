import { ResultAsync } from "npm:neverthrow@8.2.0";
import { addUser as addUserWithError } from "../../throwable/groups/add-user.ts";
import { convertError } from "../../error.ts";

export const addUser = ResultAsync.fromThrowable(
  addUserWithError,
  convertError("unknown error add a user to a group"),
);
