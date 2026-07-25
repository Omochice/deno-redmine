import {
  array,
  boolean,
  date,
  type InferOutput,
  integer,
  literal,
  minValue,
  null_,
  number,
  object,
  omit,
  optional,
  parse,
  partial,
  picklist,
  pipe,
  strictObject,
  string,
  transform,
  union,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, idName, toUndefined } from "../internal/validator.ts";
import { toUniqueArray } from "../internal/array.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type {
  Attachment,
  CreateIssueQuery,
  Include,
  Issue,
  IssueStatus,
  Journal,
  ListIssue,
  Relation,
} from "./type.ts";

export const issueStatus = pipe(
  object({
    ...idName.entries,
    ...object({
      is_closed: optional(boolean()),
    }).entries,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies IssueStatus;
  }),
);

const customField = union([
  object({
    id: number(),
    name: string(),
    value: pipe(
      union([string(), null_()]),
      transform(toUndefined),
    ),
  }),
  object({
    id: number(),
    name: string(),
    multiple: boolean(),
    value: pipe(
      union([array(string()), null_()]),
      transform(toUndefined),
    ),
  }),
]);

export const issueSchema = pipe(
  object({
    id: number(),
    project: idName,
    tracker: idName,
    status: issueStatus,
    priority: idName,
    author: idName,
    assigned_to: pipe(
      optional(union([idName, null_()])),
      transform(toUndefined),
    ),
    category: pipe(
      optional(union([idName, null_()])),
      transform(toUndefined),
    ),
    subject: string(),
    description: pipe(
      union([string(), null_()]),
      transform(toUndefined),
    ),
    start_date: pipe(
      union([dateLikeString, null_()]),
      transform(toUndefined),
    ),
    due_date: pipe(
      union([dateLikeString, null_()]),
      transform(toUndefined),
    ),
    done_ratio: number(),
    is_private: boolean(),
    estimated_hours: pipe(
      union([number(), null_()]),
      transform(toUndefined),
    ),
    total_estimated_hours: pipe(
      optional(union([number(), null_()])),
      transform(toUndefined),
    ),
    spent_hours: pipe(
      optional(number()),
      transform(toUndefined),
    ),
    total_spent_hours: pipe(
      optional(number()),
      transform(toUndefined),
    ),
    created_on: dateLikeString,
    updated_on: dateLikeString,
    closed_on: pipe(
      union([dateLikeString, null_()]),
      transform(toUndefined),
    ),
    custom_fields: pipe(
      optional(array(customField)),
      transform(toUndefined),
    ),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Issue;
  }),
);

const attachments = pipe(
  object({
    id: number(),
    filename: string(),
    filesize: number(),
    content_type: string(),
    description: string(),
    content_url: string(),
    author: idName,
    created_on: dateLikeString,
    thumbnail_url: optional(string()),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Attachment;
  }),
);

const relation = pipe(
  object({
    id: optional(number()),
    issue_id: optional(number()),
    issue_to_id: optional(number()),
    relation_type: optional(string()),
    delay: pipe(
      optional(union([number(), null_()])),
      transform(toUndefined),
    ),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Relation;
  }),
);

const journal = pipe(
  object({
    id: number(),
    user: idName,
    notes: pipe(
      union([string(), null_()]),
      transform(toUndefined),
    ),
    created_on: dateLikeString,
    private_notes: boolean(),
    details: array(object({
      property: string(),
      name: string(),
      old_value: pipe(
        union([string(), null_()]),
        transform(toUndefined),
      ),
      new_value: pipe(
        union([string(), null_()]),
        transform(toUndefined),
      ),
    })),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Journal;
  }),
);

export const include = pipe(
  object({
    changesets: optional(array(string())),
    children: optional(array(object({
      id: number(),
      tracker: idName,
      subject: string(),
    }))),
    attachments: optional(array(attachments)),
    relations: optional(array(relation)),
    journals: optional(array(journal)),
    watchers: optional(array(idName)),
    allowed_statuses: optional(array(issueStatus)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Include;
  }),
);

export const showIssue = pipe(
  object({
    ...issueSchema.entries,
    ...include.entries,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Issue & Include;
  }),
);

export const showIssueSchema = object({
  issue: showIssue,
});

// Only attachments/relations are spread here, not the full include.entries,
// because the list endpoint only supports include=attachments/relations.
const listIssueSchema = pipe(
  object({
    ...issueSchema.entries,
    attachments: optional(array(attachments)),
    relations: optional(array(relation)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies ListIssue;
  }),
);

// Redmine expects dates as YYYY-MM-DD strings. The UTC date part is used
// rather than the local calendar fields because dateLikeString parses
// Redmine's date-only strings as UTC midnight, so only UTC keeps a
// show() -> update() round-trip on the same calendar day. The trade-off:
// a Date built from local calendar fields (e.g. new Date(2026, 6, 1) in
// UTC+9) serializes to the previous day.
function toRedmineDateString(input: Date): string {
  return input.toISOString().slice(0, 10);
}

const toRedmineDate = pipe(date(), transform(toRedmineDateString));

// The schema keys are camelCase to match the public UpdateIssueQuery input.
// valibot's object() strips unknown keys, so a snake_case schema would drop
// every camelCase-only field before objectToSnake could convert it.
export const toUpdateRequest = pipe(
  partial(object({
    subject: string(),
    description: string(),
    notes: string(),
    privateNotes: boolean(),
    doneRatio: number(),
    isPrivate: boolean(),
    estimatedHours: number(),
    startDate: toRedmineDate,
    dueDate: toRedmineDate,
    customFields: array(object({
      id: number(),
      value: optional(union([string(), array(string())])),
    })),
  })),
  transform((input) => {
    return objectToSnake(input);
  }),
);

// object({}) has no entries, so valibot strips every key from each element
// (see the bug this schema fixes: id/value were silently dropped, sending
// custom_fields: [{}] to Redmine). List the fields explicitly instead.
const createCustomField = object({
  id: number(),
  value: union([string(), array(string())]),
});

export const toCreateRequest = pipe(
  object({
    projectId: number(),
    trackerId: number(),
    statusId: number(),
    priorityId: number(),
    subject: string(),
    description: optional(string()),
    categoryId: optional(number()),
    fixedVersionId: optional(number()),
    assignedToId: optional(number()),
    parentIssueId: optional(number()),
    watcherUserIds: optional(array(number())),
    isPrivate: optional(boolean()),
    estimatedHours: optional(number()),
    customFields: optional(array(createCustomField)),
  }),
  transform((input: CreateIssueQuery) => {
    return { issue: objectToSnake(input) };
  }),
);

export const listResponse = pipe(
  object({
    issues: array(listIssueSchema),
    total_count: number(),
    offset: number(),
    limit: number(),
  }),
  transform((input) => {
    return objectToCamel(input);
  }),
);

const listIncludeValue = picklist(["attachments", "relations"]);

const listInclude = pipe(
  union([listIncludeValue, array(listIncludeValue)]),
  transform((value) => toUniqueArray(value)),
);

// Redmine accepts 0 (t-0 means "today"); negatives and fractional counts
// have no wire representation, so both are rejected at parse time.
const dayOffset = pipe(number(), integer(), minValue(0));

// Named periods and presence checks that every :date/:date_past field
// accepts (see PastDateFilter's jsdoc in issues/type.ts).
const namedPeriod = picklist([
  "today",
  "yesterday",
  "thisWeek",
  "lastWeek",
  "lastTwoWeeks",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "any",
  "none",
]);

// Future-looking named periods, valid only on :date fields (start_date/
// due_date) - :date_past fields reject them with a 422, same as
// daysFromNow above.
const futureNamedPeriod = picklist(["tomorrow", "nextWeek", "nextMonth"]);

// strictObject (not object) is required for the from/to variants: object()
// silently strips unknown keys, so object({ from: date() }) would also
// match { from, to } and drop `to`, emitting `>=` where `><` was meant.
const pastDateFilter = union([
  date(),
  namedPeriod,
  strictObject({ from: date(), to: optional(date()) }),
  strictObject({ from: optional(date()), to: date() }),
  strictObject({ daysAgo: dayOffset }),
  strictObject({
    from: strictObject({ daysAgo: dayOffset }),
    to: optional(literal("today")),
  }),
  strictObject({ to: strictObject({ daysAgo: dayOffset }) }),
]);

// Widens pastDateFilter with future-looking operators that Redmine's
// :date_past fields (created_on/updated_on/closed_on) reject with a 422 -
// see PastDateFilter's jsdoc in issues/type.ts for why the split exists.
const dateFilter = union([
  ...pastDateFilter.options,
  futureNamedPeriod,
  strictObject({ daysFromNow: dayOffset }),
  strictObject({ from: strictObject({ daysFromNow: dayOffset }) }),
  strictObject({ to: strictObject({ daysFromNow: dayOffset }) }),
  strictObject({
    from: literal("today"),
    to: strictObject({ daysFromNow: dayOffset }),
  }),
]);

const listIssueQuery = partial(
  object({
    limit: pipe(number(), integer(), minValue(1)),
    include: listInclude,
    issueId: union([array(number()), number()]),
    projectId: number(),
    subprojectId: string(),
    trackerId: number(),
    statusId: union([picklist(["open", "closed", "*"]), number()]),
    priorityId: number(),
    categoryId: number(),
    fixedVersionId: number(),
    assignedToId: union([number(), literal("me")]),
    authorId: union([number(), literal("me")]),
    parentId: string(),
    startDate: dateFilter,
    dueDate: dateFilter,
    createdOn: pastDateFilter,
    updatedOn: pastDateFilter,
    closedOn: pastDateFilter,
    customField: array(object({
      id: number(),
      value: string(),
    })),
  }),
);

export const toListOption = pipe(
  listIssueQuery,
  transform((input) => {
    return {
      ...parse(toQueryObject, input),
      ...parse(toCustomFieldOption, input.customField),
      ...toDateFilterOption(input),
    };
  }),
);

const toQueryObject = pipe(
  omit(listIssueQuery, [
    "customField",
    "limit",
    "startDate",
    "dueDate",
    "createdOn",
    "updatedOn",
    "closedOn",
  ]),
  transform((input) => {
    return objectToSnake(input);
  }),
  transform((input) => {
    return Object.fromEntries(
      Object.entries(input).map(([key, value]) => [
        key,
        `${value}`,
      ]),
    );
  }),
);

const toCustomFieldOption = pipe(
  optional(array(object({ id: number(), value: string() }))),
  transform((input) => {
    if (input == null) {
      return {};
    }
    return Object.fromEntries(
      input.map(({ id, value }) => [`cf_${id}`, value]),
    );
  }),
);

// Named-period and presence literals map to a fixed operator with no
// interpolation, unlike the daysAgo/daysFromNow branches below - see
// PastDateFilter/DateFilter's jsdoc in issues/type.ts for which literals
// each field accepts.
const namedPeriodOperators: Record<string, string> = {
  today: "t",
  yesterday: "ld",
  thisWeek: "w",
  lastWeek: "lw",
  lastTwoWeeks: "l2w",
  thisMonth: "m",
  lastMonth: "lm",
  thisYear: "y",
  any: "*",
  none: "!*",
  tomorrow: "nd",
  nextWeek: "nw",
  nextMonth: "nm",
};

type DateBound = Date | "today" | { daysAgo: number } | { daysFromNow: number };

function toBoundKind(bound: DateBound | undefined): string {
  if (bound === undefined) {
    return "absent";
  }
  if (bound === "today") {
    return "today";
  }
  if (bound instanceof Date) {
    return "date";
  }
  return "daysAgo" in bound ? "past" : "future";
}

// "today" contributes no value of its own: it only tells Redmine which of the
// bounded operators to use (><t- pins the upper end to today, ><t+ the lower).
function toBoundValue(bound: DateBound): string {
  if (bound === "today") {
    return "";
  }
  if (bound instanceof Date) {
    return toRedmineDateString(bound);
  }
  return `${"daysAgo" in bound ? bound.daysAgo : bound.daysFromNow}`;
}

// Which operator a range maps to depends only on the kind of each bound, not
// on the values, so the nine combinations the schema admits are listed here
// instead of being rediscovered by nested conditionals.
const rangeOperators: Record<string, string> = {
  "date/absent": ">=",
  "absent/date": "<=",
  "date/date": "><",
  "past/absent": ">t-",
  "past/today": "><t-",
  "absent/past": "<t-",
  "future/absent": ">t+",
  "today/future": "><t+",
  "absent/future": "<t+",
};

// Redmine's short filter wire form: field=<operator><values joined by |>.
// Nothing separates the operator from its first value: add_short_filter runs
// `values.split('|')` on whatever follows the operator, so `t-|3` would split
// to ["", "3"] and Redmine rejects the blank first value with a 422. Only the
// two-date `><` form carries a pipe, because it really does pass two values.
// There is no strict >/<, so absolute from/to bounds are always inclusive.
function toDateFilterQueryValue(
  value: InferOutput<typeof dateFilter>,
): string {
  if (value instanceof Date) {
    return `=${toRedmineDateString(value)}`;
  }
  if (typeof value === "string") {
    return namedPeriodOperators[value];
  }
  if ("daysAgo" in value) {
    return `t-${value.daysAgo}`;
  }
  if ("daysFromNow" in value) {
    return `t+${value.daysFromNow}`;
  }

  const from = "from" in value ? value.from : undefined;
  const to = "to" in value ? value.to : undefined;
  const operator = rangeOperators[`${toBoundKind(from)}/${toBoundKind(to)}`];
  const values = [from, to]
    .filter((bound) => bound !== undefined)
    .map(toBoundValue)
    .filter((serialized) => serialized !== "");
  return `${operator}${values.join("|")}`;
}

// Field names are listed explicitly (as toCustomFieldOption does) rather
// than run through objectToSnake, because objectToSnake deep-converts
// nested object keys and would reach into the from/to Date instances.
const dateFilterFields = [
  ["startDate", "start_date"],
  ["dueDate", "due_date"],
  ["createdOn", "created_on"],
  ["updatedOn", "updated_on"],
  ["closedOn", "closed_on"],
] as const;

function toDateFilterOption(
  input: Partial<
    Record<
      typeof dateFilterFields[number][0],
      InferOutput<typeof dateFilter>
    >
  >,
): Record<string, string> {
  return Object.fromEntries(
    dateFilterFields
      .filter(([key]) => input[key] !== undefined)
      .map((
        [key, param],
      ) => [param, toDateFilterQueryValue(input[key]!)]),
  );
}
