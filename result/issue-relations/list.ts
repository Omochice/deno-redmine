import { ResultAsync } from "npm:neverthrow@8.2.0";
import { fetchList as fetchListWithError } from "../../throwable/issue-relations/list.ts";
import { convertError } from "../../error.ts";

export const fetchList = ResultAsync.fromThrowable(
  fetchListWithError,
  convertError("unknown error fetching relations"),
);
