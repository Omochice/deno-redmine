import {
  nullish,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import {
  dateLikeString,
  idName,
  toUndefined,
} from "../../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { ProjectFile } from "./type.ts";

export const fileSchema = pipe(
  object({
    id: number(),
    filename: string(),
    filesize: number(),
    content_type: string(),
    content_url: string(),
    description: pipe(nullish(string()), transform(toUndefined)),
    version: optional(idName),
    digest: string(),
    downloads: number(),
    author: idName,
    created_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies ProjectFile;
  }),
);

export const uploadResponseSchema = object({
  upload: object({
    token: string(),
  }),
});

const createFileQuerySchema = object({
  token: string(),
  versionId: optional(number()),
  filename: optional(string()),
  description: optional(string()),
});

export const toCreateFileQuery = pipe(
  createFileQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);
