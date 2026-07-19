import {
  array,
  boolean,
  nullish,
  number,
  object,
  partial,
  pipe,
  record,
  string,
  transform,
  unknown,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, toUndefined } from "../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { MyAccount } from "./type.ts";

const customFieldValueSchema = object({
  id: number(),
  name: string(),
  value: unknown(),
});

export const myAccountSchema = pipe(
  object({
    id: number(),
    login: string(),
    firstname: string(),
    lastname: string(),
    mail: string(),
    created_on: dateLikeString,
    last_login_on: pipe(nullish(dateLikeString), transform(toUndefined)),
    api_key: pipe(nullish(string()), transform(toUndefined)),
    admin: pipe(nullish(boolean()), transform(toUndefined)),
    mail_notification: pipe(nullish(string()), transform(toUndefined)),
    custom_fields: pipe(
      nullish(array(customFieldValueSchema)),
      transform(toUndefined),
    ),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies MyAccount;
  }),
);

const updateMyAccountQuerySchema = partial(object({
  firstname: string(),
  lastname: string(),
  mail: string(),
  customFieldValues: record(string(), unknown()),
}));

export const toUpdateMyAccountQuery = pipe(
  updateMyAccountQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);
