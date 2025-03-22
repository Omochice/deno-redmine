import {
  array,
  boolean,
  custom,
  type InferOutput,
  null_,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
  union,
} from "jsr:@valibot/valibot@0.42.1";

export type IdName = InferOutput<typeof IdName>;
export const IdName = object({
  id: number(),
  name: string(),
});

export type IssueStatus = InferOutput<typeof IssueStatus>;
export const IssueStatus = object({
  ...IdName.entries,
  ...object({
    is_closed: optional(boolean()),
  }).entries,
});

const dateLikeString = pipe(
  string(),
  custom((input) => {
    if (typeof input !== "string") {
      return false;
    }
    return !isNaN(Date.parse(input));
  }),
  transform((input) => new Date(input)),
);

function toUndefined<T>(input: T | null | undefined): T | undefined {
  return input ?? undefined;
}

const customFieldSchema = union([
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

export const issueSchema = object({
  id: number(),
  project: IdName,
  tracker: IdName,
  status: IssueStatus,
  priority: IdName,
  author: IdName,
  assigned_to: pipe(
    optional(union([IdName, null_()])),
    transform(toUndefined),
  ),
  category: pipe(
    optional(union([IdName, null_()])),
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
    optional(array(customFieldSchema)),
    transform(toUndefined),
  ),
});

export type Issue = InferOutput<typeof issueSchema>;

export const includeSchema = object({
  changesets: optional(array(string())),
  children: optional(array(object({
    id: number(),
    tracker: IdName,
    subject: string(),
  }))),
  attachments: optional(array(object({
    id: number(),
    filename: string(),
    filesize: number(),
    content_type: string(),
    description: string(),
    content_url: string(),
    author: IdName,
    created_on: dateLikeString,
    thumbnail_url: optional(string()),
  }))),
  relations: optional(array(object({
    id: optional(number()),
    issue_id: optional(number()),
    issue_to_id: optional(number()),
    relation_type: optional(string()),
    delay: pipe(
      optional(union([number(), null_()])),
      transform(toUndefined),
    ),
  }))),
  journals: optional(array(object({
    id: number(),
    user: IdName,
    notes: string(),
    created_on: string(),
    private_notes: boolean(),
    details: array(object({
      property: string(),
      name: string(),
      old_value: pipe(
        union([string(), null_()]),
        transform(toUndefined),
      ),
      new_value: string(),
    })),
  }))),
  watchers: optional(array(IdName)),
  allowed_statuses: optional(array(IssueStatus)),
});

export const showIssueSchema = object({
  ...issueSchema.entries,
  ...includeSchema.entries,
});

export type ShowIssue = InferOutput<typeof showIssueSchema>;
