import {
  array,
  boolean,
  nullish,
  number,
  object,
  pipe,
  string,
  transform,
  union,
} from "jsr:@valibot/valibot@1.4.2";
import { idName, toUndefined } from "../internal/validator.ts";
import { objectToCamel } from "npm:ts-case-convert@2.3.1";
import type { CustomField } from "./type.ts";

// Redmine renders list-type possible values as plain strings on older
// versions and as `{ value, label }` objects on newer ones. Accepting both
// shapes keeps this schema working across the Redmine versions users run.
const possibleValueEntry = union([
  pipe(string(), transform((value) => ({ value }))),
  object({
    value: string(),
    label: pipe(nullish(string()), transform(toUndefined)),
  }),
]);

const customFieldSchema = pipe(
  object({
    id: number(),
    name: string(),
    customized_type: string(),
    field_format: string(),
    regexp: pipe(nullish(string()), transform(toUndefined)),
    min_length: pipe(nullish(number()), transform(toUndefined)),
    max_length: pipe(nullish(number()), transform(toUndefined)),
    is_required: boolean(),
    is_filter: boolean(),
    searchable: boolean(),
    multiple: boolean(),
    default_value: pipe(nullish(string()), transform(toUndefined)),
    visible: boolean(),
    possible_values: pipe(
      nullish(array(possibleValueEntry)),
      transform(toUndefined),
    ),
    trackers: pipe(nullish(array(idName)), transform(toUndefined)),
    roles: pipe(nullish(array(idName)), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies CustomField;
  }),
);

export const listCustomFieldResponse = object({
  custom_fields: array(customFieldSchema),
});
