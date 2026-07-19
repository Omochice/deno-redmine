import type { IdName } from "../internal/type.ts";

export type TimeEntry = {
  id: number;
  project: IdName;
  issue?: { id: number };
  user: IdName;
  activity: IdName;
  hours: number;
  comments?: string;
  spentOn: Date;
  createdOn: Date;
  updatedOn: Date;
};

export type CreateTimeEntryQuery = {
  issueId?: number;
  projectId?: number;
  spentOn?: Date;
  hours: number;
  activityId?: number;
  comments?: string;
};

export type UpdateTimeEntryQuery = Partial<CreateTimeEntryQuery>;

export type ListTimeEntryQuery = {
  projectId: number;
  spentOn: Date;
  userId: number;
  from: Date;
  to: Date;
};
