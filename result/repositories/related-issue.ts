import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../../error.ts";
import {
  addRelatedIssue as addRelatedIssueWithError,
  removeRelatedIssue as removeRelatedIssueWithError,
} from "../../throwable/repositories/related-issue.ts";

export const addRelatedIssue = ResultAsync.fromThrowable(
  addRelatedIssueWithError,
  convertError("unknown error add a related issue to the revision"),
);

export const removeRelatedIssue = ResultAsync.fromThrowable(
  removeRelatedIssueWithError,
  convertError("unknown error remove a related issue from the revision"),
);
