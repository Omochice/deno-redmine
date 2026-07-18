import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import {
  close as closeWithError,
  reopen as reopenWithError,
} from "../../throwable/projects/close.ts";

export const close = ResultAsync.fromThrowable(
  closeWithError,
  convertError("unknown error close a project"),
);

export const reopen = ResultAsync.fromThrowable(
  reopenWithError,
  convertError("unknown error reopen a project"),
);
