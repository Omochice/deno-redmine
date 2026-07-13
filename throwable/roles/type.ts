export type Role = {
  id: number;
  name: string;
  assignable: boolean;
  issuesVisibility: string;
  timeEntriesVisibility: string;
  usersVisibility: string;
  permissions: string[];
};
