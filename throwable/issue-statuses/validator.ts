import {
  array,
  boolean,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { IssueStatus } from "./type.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";

const issueStatusSchema = pipe(
  object({
    id: number(),
    name: string(),
    is_closed: boolean(),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies IssueStatus;
  }),
);

export const listIssueStatusResponse = object({
  issue_statuses: array(issueStatusSchema),
});
