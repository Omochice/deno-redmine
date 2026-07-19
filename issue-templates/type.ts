export type IssueTemplate = {
  id: number;
  trackerId: number;
  trackerName: string;
  title: string;
  issueTitle: string;
  description: string;
  enabled: boolean;
  updatedOn: Date;
  createdOn: Date;
};

export type Response_ = {
  globalIssueTemplates: IssueTemplate[];
  inheritTemplates: IssueTemplate[];
  issueTemplates: IssueTemplate[];
};
