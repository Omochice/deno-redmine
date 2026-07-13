import { ResultAsync } from "npm:neverthrow@8.2.0";
import { show as showWithError } from "../../throwable/time-entries/show.ts";
import { convertError } from "../../error.ts";

export const show = ResultAsync.fromThrowable(
  showWithError,
  convertError("unknown error show a time entry"),
);
