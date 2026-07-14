export type RelationType =
  | "relates"
  | "duplicates"
  | "duplicated"
  | "blocks"
  | "blocked"
  | "precedes"
  | "follows"
  | "copied_to"
  | "copied_from";

export type Relation = {
  id: number;
  issueId: number;
  issueToId: number;
  relationType: RelationType;
  delay?: number;
};

export type CreateRelationQuery = {
  issueToId: number;
  relationType: RelationType;
  delay?: number;
};
