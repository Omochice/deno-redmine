export type SearchResult = {
  id: number;
  title: string;
  type: string;
  url: string;
  description?: string;
  datetime: Date;
};

export type SearchQuery = {
  q: string;
  scope?: string;
  allWords?: boolean;
  titlesOnly?: boolean;
  openIssues?: boolean;
  issues?: boolean;
  news?: boolean;
  documents?: boolean;
  changesets?: boolean;
  wikiPages?: boolean;
  messages?: boolean;
  projects?: boolean;
  attachments?: boolean | string;
};
