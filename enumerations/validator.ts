import {
  array,
  boolean,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { Enumeration } from "./type.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";

// Issue priorities, time entry activities, and document categories are all
// instances of Redmine's Enumeration model, so a single item schema covers
// all three response shapes below.
const enumerationSchema = pipe(
  object({
    id: number(),
    name: string(),
    is_default: boolean(),
    active: boolean(),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Enumeration;
  }),
);

export const listIssuePriorityResponse = object({
  issue_priorities: array(enumerationSchema),
});

export const listTimeEntryActivityResponse = object({
  time_entry_activities: array(enumerationSchema),
});

export const listDocumentCategoryResponse = object({
  document_categories: array(enumerationSchema),
});
