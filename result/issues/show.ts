import { ResultAsync } from "npm:neverthrow@8.2.0";
import { show as showWithError } from "../../throwable/issues/show.ts";
import { convertError } from "../../error.ts";

export const show = ResultAsync.fromThrowable(
  showWithError,
  convertError("unknown error show an issue"),
);

