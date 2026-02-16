import { ResultAsync } from "npm:neverthrow@8.2.0";
import { update as updateWithError } from "../../throwable/versions/update.ts";
import { convertError } from "../../error.ts";

export const update = ResultAsync.fromThrowable(
  updateWithError,
  convertError("unknown error update a version"),
);
