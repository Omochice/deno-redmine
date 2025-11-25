import {
  array,
  nullable,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.2.0";
import { Tracker } from "./type.ts";
import { idName, toUndefined } from "../../internal/validator.ts";
import { objectToCamel } from "npm:ts-case-convert@2.1.0";

const trackerSchema = pipe(
  object({
    id: number(),
    name: string(),
    default_status: idName,
    description: pipe(nullable(string()), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Tracker;
  }),
);

export const listTrackerResponse = object({
  trackers: array(trackerSchema),
});
