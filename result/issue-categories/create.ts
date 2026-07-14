import { ResultAsync } from "npm:neverthrow@8.2.0";
import { create as createWithError } from "../../throwable/issue-categories/create.ts";
import { convertError } from "../../error.ts";

export const create = ResultAsync.fromThrowable(
  createWithError,
  convertError("unknown error create an issue category"),
);
