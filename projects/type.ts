import {
  array,
  boolean,
  custom,
  type InferOutput,
  nullish,
  number,
  object,
  optional,
  pipe,
  record,
  regex,
  string,
  transform,
  unknown,
} from "jsr:@valibot/valibot@0.42.1";

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

export const projectSchema = object({
  id: number(),
  name: string(),
  identifier: string(),
  description: nullish(string()),
  homepage: nullish(string()),
  status: number(),
  is_public: nullish(boolean()),
  inherit_members: boolean(),
  enable_new_ticket_message: nullish(number()),
  new_ticket_message: nullish(string()),
  default_version: nullish(object({
    id: number(),
    name: string(),
  })),
  created_on: dateLikeString,
  updated_on: dateLikeString,
  parent: nullish(object({
    id: number(),
    name: string(),
  })),
});

export type Project = InferOutput<typeof projectSchema>;

export const projectRequestSchema = object({
  name: pipe(
    string(),
    /** need match /[a-zA-Z0-9\-_]{1,100}/ */
    regex(/[a-zA-Z0-9\-_]{1,100}/),
  ),
  identifier: string(),
  description: optional(string()),
  homepage: optional(string()),
  is_public: optional(boolean()),
  parent_id: optional(number()),
  inherit_members: optional(boolean()),
  default_assigned_to_id: optional(number()),
  default_version_id: optional(string()),
  tracker_ids: optional(array(number())),
  enable_module_names: optional(array(string())),
  issue_custom_field_ids: optional(array(string())),
  custom_field_values: optional(record(string(), unknown())),
});

export type ProjectRequest = InferOutput<typeof projectRequestSchema>;
