import { ResultAsync } from "npm:neverthrow@8.2.0";
import { search as searchWithError } from "../../throwable/search/search.ts";
import { convertError } from "../../error.ts";

export const search = ResultAsync.fromThrowable(
  searchWithError,
  convertError("unknown error searching"),
);
