import {
  array,
  boolean,
  nullish,
  number,
  object,
  optional,
  type Output,
  record,
  regex,
  string,
  transform,
} from "https://deno.land/x/valibot@v0.30.0/mod.ts";

const inputProjectSchema = object({
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
  created_on: string(),
  updated_on: string(),
  parent: nullish(object({
    id: number(),
    name: string(),
  })),
});

export const projectSchema = transform(inputProjectSchema, (input) => {
  return {
    ...input,
    created_on: new Date(input.created_on),
    updated_on: new Date(input.updated_on),
  };
});

export type Project = Output<typeof projectSchema>;

export const projectRequestSchema = object({
  name: string([regex(/[a-zA-Z0-9\-_]{1,100}/)]),
  /** need match /[a-zA-Z0-9\-_]{1,100} */
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
  custom_field_values: optional(record(string())),
});

export type ProjectRequest = Output<typeof projectRequestSchema>;
