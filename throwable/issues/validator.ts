import {
  array,
  boolean,
  literal,
  null_,
  number,
  object,
  omit,
  optional,
  parse,
  partial,
  picklist,
  pipe,
  string,
  transform,
  union,
} from "jsr:@valibot/valibot@1.2.0";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.1.0";
import type {
  Attachment,
  CreateIssueQuery,
  Include,
  Issue,
  IssueStatus,
  Journal,
  ListIssueQuery,
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

export const toUpdateRequest = pipe(
  partial(object({
    ...issueSchema.entries,
    notes: string(),
    privateNotes: boolean(),
  })),
  transform((input) => {
    return objectToSnake(input);
  }),
);

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
    customFields: optional(array(object({}))),
  }),
  transform((input: CreateIssueQuery) => {
    return { issue: objectToSnake(input) };
  }),
);

export const listResponse = pipe(
  object({
    issues: array(issueSchema),
    total_count: number(),
    offset: number(),
    limit: number(),
  }),
  transform((input) => {
    return objectToCamel(input);
  }),
);

const listIssueQuery = partial(
  object({
    limit: number(),
    include: picklist(["attachment", "relations"]),
    issueId: union([array(number()), number()]),
    projectId: number(),
    subprojectId: string(),
    trackerId: number(),
    statusId: union([picklist(["open", "closed", "*"]), number()]),
    assignedToId: union([number(), literal("me")]),
    parentId: string(),
    customField: array(object({
      id: number(),
      value: string(),
    })),
  }),
);

export const toListOption = pipe(
  listIssueQuery,
  transform((input: Partial<ListIssueQuery>) => {
    return {
      ...parse(toQueryObject, input),
      ...parse(toCustomFieldOption, input.customField),
    };
  }),
);

const toQueryObject = pipe(
  omit(listIssueQuery, ["customField", "limit"]),
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
