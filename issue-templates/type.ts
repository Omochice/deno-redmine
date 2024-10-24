import {
  array,
  boolean,
  custom,
  type InferOutput,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@0.42.1";

const dateLikeString = pipe(
  string(),
  custom((input: unknown) => {
    if (typeof input !== "string") {
      return false;
    }
    return !isNaN(Date.parse(input));
  }),
  transform((input) => new Date(input)),
);

const templateSchema = object({
  id: number(),
  tracker_id: number(),
  tracker_name: string(),
  title: string(),
  issue_title: string(),
  description: string(),
  enabled: boolean(),
  updated_on: dateLikeString,
  created_on: dateLikeString,
});

export type IssueTemplate = InferOutput<typeof templateSchema>;

export const responseSchema = object({
  global_issue_templates: array(templateSchema),
  inherit_templates: array(templateSchema),
  issue_templates: array(templateSchema),
});

export type Response_ = InferOutput<typeof responseSchema>;
