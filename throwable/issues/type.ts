import type { IdName } from "../../internal/type.ts";

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
  notes: string;
  createdOn: Date;
  privateNotes: boolean;
  details: {
    property: string;
    name: string;
    oldValue?: string;
    newValue: string;
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

export type UpdateOption = {
  notes?: string;
  privateNotes?: boolean;
};

export type UpdateIssueQuery = Partial<Issue & UpdateOption>;

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
  isPriavte?: boolean;
  estimatedHours?: number;
  customFields?: Record<string, unknown>[];
};

export type ListIssueQuery = {
  limit: number;
  include: "attachment" | "relations";
  issueId: number[] | number;
  projectId: number;
  subprojectId: string;
  trackerId: number;
  statusId: "open" | "closed" | "*" | number;
  assignedToId: number | "me";
  parentId: string;
  customField: {
    id: number;
    value: string;
  }[];
};
