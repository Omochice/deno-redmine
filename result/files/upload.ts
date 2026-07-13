import { ResultAsync } from "npm:neverthrow@8.2.0";
import { upload as uploadWithError } from "../../throwable/files/upload.ts";
import { convertError } from "../../error.ts";

export const upload = ResultAsync.fromThrowable(
  uploadWithError,
  convertError("unknown error upload a file"),
);
