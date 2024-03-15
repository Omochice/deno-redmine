import {
  array,
  boolean,
  type Input,
  merge,
  nullType,
  number,
  object,
  optional,
  type Output,
  string,
  transform,
  union,
} from "https://deno.land/x/valibot@v0.30.0/mod.ts";

export type IdName = Output<typeof IdName>;
export const IdName = object({
  id: number(),
  name: string(),
});

export type IssueStatus = Output<typeof IssueStatus>;
export const IssueStatus = merge([
  IdName,
  object({
    is_closed: optional(boolean()),
  }),
]);

const convertDate = (input: string | null | undefined): Date | undefined => {
  if (input == null) {
    return undefined;
  }
  const date = new Date(input);
  if (date.toString() === "Invalid Date") {
    return undefined;
  }
  return date;
};

const customFieldSchema = union([
  object({
    id: number(),
    name: string(),
    value: union([string(), nullType()]),
  }),
  object({
    id: number(),
    name: string(),
    multiple: boolean(),
    value: union([array(string()), nullType()]),
  }),
]);

const convertCustomField = (
  customField: Input<typeof customFieldSchema> | null | undefined,
) => {
  if (customField == null) {
    return undefined;
  }
  return {
    ...customField,
    value: customField.value == null ? undefined : customField.value,
  };
};

const inputIssueSchema = object({
  id: number(),
  project: IdName,
  tracker: IdName,
  status: IssueStatus,
  priority: IdName,
  author: IdName,
  assigned_to: optional(union([IdName, nullType()])),
  category: optional(union([IdName, nullType()])),
  subject: string(),
  description: union([string(), nullType()]),
  start_date: union([string(), nullType()]),
  due_date: union([string(), nullType()]),
  done_ratio: number(),
  is_private: boolean(),
  estimated_hours: union([number(), nullType()]),
  total_estimated_hours: optional(union([number(), nullType()])),
  spent_hours: optional(number()),
  total_spent_hours: optional(number()),
  created_on: string(),
  updated_on: string(),
  closed_on: union([string(), nullType()]),
  custom_fields: optional(array(customFieldSchema)),
});

function normalizeIssue(input: Output<typeof inputIssueSchema>) {
  return {
    ...input,
    assigned_to: input.assigned_to ?? undefined,
    category: input.category ?? undefined,
    description: input.description ?? undefined,
    start_date: convertDate(input.start_date ?? undefined),
    due_date: convertDate(input.due_date ?? undefined),
    estimated_hours: input.estimated_hours ?? undefined,
    total_estimated_hours: input.total_spent_hours ?? undefined,
    created_on: convertDate(input.created_on),
    updated_on: convertDate(input.updated_on),
    closed_on: convertDate(input.closed_on ?? undefined),
    custom_fields: input.custom_fields?.map(convertCustomField),
  };
}

export const issueSchema = transform(inputIssueSchema, normalizeIssue);

export type Issue = Output<typeof issueSchema>;

const inputIncludeSchema = object({
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
    created_on: string(),
    thumbnail_url: optional(string()),
  }))),
  relations: optional(array(object({
    id: optional(number()),
    issue_id: optional(number()),
    issue_to_id: optional(number()),
    relation_type: optional(string()),
    delay: optional(union([number(), nullType()])),
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
      old_value: union([string(), nullType()]),
      new_value: string(),
    })),
  }))),
  watchers: optional(array(IdName)),
  allowed_statuses: optional(array(IssueStatus)),
});

function normalizeInclude(input: Output<typeof inputIncludeSchema>) {
  return {
    changesets: input.changesets,
    children: input.children,
    attachments: input.attachments?.map((attachment) => {
      return {
        ...attachment,
        created_on: new Date(attachment.created_on),
      };
    }),
    relations: input.relations?.map((relation) => ({
      ...relation,
      delay: relation.delay ?? undefined,
    })),
    journals: input.journals?.map((journal) => ({
      ...journal,
      details: journal.details.map((detail) => ({
        ...detail,
        old_value: detail.old_value ?? undefined,
      })),
    })),
  };
}

export const includeSchema = transform(inputIncludeSchema, normalizeInclude);

export const showIssueSchema = transform(
  merge([issueSchema, includeSchema]),
  (input) => {
    return {
      ...normalizeIssue(input),
      ...normalizeInclude(input),
    };
  },
);

export type ShowIssue = Output<typeof showIssueSchema>;
