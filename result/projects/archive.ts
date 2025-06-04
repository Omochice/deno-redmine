import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import {
  archive as archiveWithError,
  unarchive as unarchiveWithError,
} from "../../throwable/projects/archive.ts";

export const archive = ResultAsync.fromThrowable(
  archiveWithError,
  convertError("unknown error archive a project"),
);

export const unarchive = ResultAsync.fromThrowable(
  unarchiveWithError,
  convertError("unknown error unarchive a project"),
);
