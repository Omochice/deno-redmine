import {
  array,
  boolean,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.1.0";
import { dateLikeString } from "../../internal/validator.ts";
import type { IssueTemplate, Response_ } from "./type.ts";
import { objectToCamel } from "npm:ts-case-convert@2.1.0";

export const issueTemplate = pipe(
  object({
    id: number(),
    tracker_id: number(),
    tracker_name: string(),
    title: string(),
    issue_title: string(),
    description: string(),
    enabled: boolean(),
    updated_on: dateLikeString,
    created_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies IssueTemplate;
  }),
);

export const issueTemplateResponse = pipe(
  object({
    global_issue_templates: array(issueTemplate),
    inherit_templates: array(issueTemplate),
    issue_templates: array(issueTemplate),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Response_;
  }),
);
