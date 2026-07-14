import {
  date,
  nullish,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { TimeEntry } from "./type.ts";

export const timeEntrySchema = pipe(
  object({
    id: number(),
    project: idName,
    issue: pipe(
      nullish(object({ id: number() })),
      transform(toUndefined),
    ),
    user: idName,
    activity: idName,
    hours: number(),
    comments: pipe(nullish(string()), transform(toUndefined)),
    spent_on: dateLikeString,
    created_on: dateLikeString,
    updated_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies TimeEntry;
  }),
);

// Redmine expects dates as YYYY-MM-DD strings. The UTC date part is used
// rather than the local calendar fields because dateLikeString parses
// Redmine's date-only strings as UTC midnight, so only UTC keeps a
// show() -> update() round-trip on the same calendar day. The trade-off:
// a Date built from local calendar fields (e.g. new Date(2026, 6, 1) in
// UTC+9) serializes to the previous day.
const toRedmineDate = pipe(
  date(),
  transform((input: Date) => input.toISOString().slice(0, 10)),
);

const createTimeEntryQuerySchema = object({
  issueId: optional(number()),
  projectId: optional(number()),
  spentOn: optional(toRedmineDate),
  hours: number(),
  activityId: optional(number()),
  comments: optional(string()),
});

export const toCreateTimeEntryQuery = pipe(
  createTimeEntryQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateTimeEntryQuery = pipe(
  partial(createTimeEntryQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);

// The filter values are serialized to strings here (rather than left as
// number/Date) because URLSearchParams only accepts strings, and fetchList
// spreads this object directly into the query string alongside limit/offset.
export const toListTimeEntryQuery = pipe(
  partial(object({
    projectId: number(),
    spentOn: toRedmineDate,
    userId: number(),
    from: toRedmineDate,
    to: toRedmineDate,
  })),
  transform((input) => {
    return objectToSnake(input);
  }),
  transform((input) => {
    // Drop keys an explicit `undefined` left behind; otherwise they would
    // serialize to the literal string "undefined" (e.g. `project_id=undefined`)
    // and Redmine would reject the request.
    return Object.fromEntries(
      Object.entries(input)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, `${value}`]),
    );
  }),
);
