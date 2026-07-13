import {
  boolean,
  nullish,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, toUndefined } from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { User } from "./type.ts";

export const userSchema = pipe(
  object({
    id: number(),
    login: string(),
    firstname: string(),
    lastname: string(),
    mail: string(),
    created_on: dateLikeString,
    updated_on: pipe(nullish(dateLikeString), transform(toUndefined)),
    last_login_on: pipe(nullish(dateLikeString), transform(toUndefined)),
    admin: pipe(nullish(boolean()), transform(toUndefined)),
    // Only present in responses for admins or the authenticated user itself.
    api_key: pipe(nullish(string()), transform(toUndefined)),
    // Only present in responses for admins.
    status: pipe(nullish(number()), transform(toUndefined)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies User;
  }),
);

const createUserQuerySchema = object({
  login: string(),
  firstname: string(),
  lastname: string(),
  mail: string(),
  password: optional(string()),
  authSourceId: optional(number()),
  mailNotification: optional(string()),
  mustChangePasswd: optional(boolean()),
  generatePassword: optional(boolean()),
  status: optional(number()),
  admin: optional(boolean()),
});

export const toCreateUserQuery = pipe(
  createUserQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateUserQuery = pipe(
  partial(createUserQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
