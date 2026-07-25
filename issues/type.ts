import type { IdName } from "../internal/type.ts";

export type IssueStatus = IdName & {
  isClosed?: boolean;
};

export type CustomField = {
  id: number;
  name: string;
  value?: string[];
  multiple?: boolean;
} | {
  id: number;
  name: string;
  value?: string;
};

export type Issue = {
  id: number;
  project: IdName;
  tracker: IdName;
  status: IssueStatus;
  priority: IdName;
  author: IdName;
  assignedTo?: IdName;
  category?: IdName;
  subject: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  doneRatio: number;
  isPrivate: boolean;
  estimatedHours?: number;
  totalEstimatedHours?: number;
  spentHours?: number;
  totalSpentHours?: number;
  createdOn: Date;
  updatedOn: Date;
  closedOn?: Date;
  customFields?: CustomField[];
};

export type Attachment = {
  id: number;
  filename: string;
  contentType: string;
  filesize: number;
  description: string;
  contentUrl: string;
  author: IdName;
  createdOn: Date;
  thumbnailUrl?: string;
};

export type Relation = {
  id?: number;
  issueId?: number;
  issueToId?: number;
  relationType?: string;
  delay?: number;
};

export type Journal = {
  id: number;
  user: IdName;
  notes?: string;
  createdOn: Date;
  privateNotes: boolean;
  details: {
    property: string;
    name: string;
    oldValue?: string;
    newValue?: string;
  }[];
};

export type Include = {
  changesets?: string[];
  children?: {
    id: number;
    tracker: IdName;
    subject: string;
  }[];
  attachments?: Attachment[];
  relations?: Relation[];
  journals?: Journal[];
  watchers?: IdName[];
  allowedStatuses?: IssueStatus[];
};

export type ShowIssue = Issue & Include;

// The list endpoint only supports include=attachments/relations (unlike
// show, which supports the full Include set), so the list result widens
// Issue with just those two associations rather than the whole Include type.
export type ListIssue = Issue & Pick<Include, "attachments" | "relations">;

export type UpdateOption = {
  notes?: string;
  privateNotes?: boolean;
};

export type UpdateIssueQuery = Partial<Issue & UpdateOption>;

// Redmine accepts a single string for single-value custom fields and a
// string array for multi-value ones; both are set through the same "value"
// key on create, unlike the read-side CustomField which also carries "name".
export type CustomFieldInput = {
  id: number;
  value: string | string[];
};

export type CreateIssueQuery = {
  projectId: number;
  trackerId: number;
  statusId: number;
  priorityId: number;
  subject: string;
  description?: string;
  categoryId?: number;
  fixedVersionId?: number;
  assignedToId?: number;
  parentIssueId?: number;
  watcherUserIds?: number[];
  isPrivate?: boolean;
  estimatedHours?: number;
  customFields?: CustomFieldInput[];
};

export type ListIncludeValue = "attachments" | "relations";

// `from`/`to` are both inclusive: Redmine's absolute date operators are
// limited to `=`, `>=`, `<=`, `><` (no strict `>`/`<`), so every bound this
// library exposes is inclusive too. This type omits future-looking
// operators (e.g. `daysFromNow`) because Redmine's `:date_past` fields
// (created_on/updated_on/closed_on) reject them with a 422; DateFilter below
// is the wider type for fields that accept them.
export type PastDateFilter =
  | Date
  | { daysAgo: number }
  | "today"
  | "yesterday"
  | "thisWeek"
  | "lastWeek"
  | "lastTwoWeeks"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "any"
  | "none"
  | { from: Date; to?: Date }
  | { from?: Date; to: Date }
  | { from: { daysAgo: number }; to?: "today" }
  | { to: { daysAgo: number } };

// Widens PastDateFilter with future-looking operators, for the `:date`
// fields (start_date/due_date) that accept them - unlike `:date_past` fields,
// which reject them with a 422 (see PastDateFilter above).
export type DateFilter =
  | PastDateFilter
  | { daysFromNow: number }
  | "tomorrow"
  | "nextWeek"
  | "nextMonth"
  | { from: { daysFromNow: number } }
  | { to: { daysFromNow: number } }
  | { from: "today"; to: { daysFromNow: number } };

export type ListIssueQuery =
  & {
    limit?: number;
    include?: ListIncludeValue | [ListIncludeValue, ...ListIncludeValue[]];
    issueId?: number[] | number;
    projectId?: number;
    trackerId?: number;
    statusId?: "open" | "closed" | "*" | number;
    priorityId?: number;
    fixedVersionId?: number;
    assignedToId?: number | "me";
    authorId?: number | "me";
    parentId?: string;
    startDate?: DateFilter;
    dueDate?: DateFilter;
    createdOn?: PastDateFilter;
    updatedOn?: PastDateFilter;
    closedOn?: PastDateFilter;
    customField?: {
      id: number;
      value: string;
    }[];
  }
  & (
    // Redmine ignores category_id without a project scope.
    | { categoryId?: never }
    | { categoryId: number; projectId: number }
  )
  & (
    // Likewise, subproject_id is ignored without a project scope.
    | { subprojectId?: never }
    | { subprojectId: string; projectId: number }
  );
