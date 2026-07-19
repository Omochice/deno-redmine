import {
  nullish,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { dateLikeString, idName, toUndefined } from "../internal/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";
import type { Attachment } from "./type.ts";

export const attachmentSchema = pipe(
  object({
    id: number(),
    filename: string(),
    filesize: number(),
    content_type: string(),
    description: pipe(nullish(string()), transform(toUndefined)),
    content_url: string(),
    thumbnail_url: optional(string()),
    author: idName,
    created_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies Attachment;
  }),
);

const updateAttachmentQuerySchema = object({
  filename: optional(string()),
  description: optional(string()),
});

export const toUpdateAttachmentQuery = pipe(
  partial(updateAttachmentQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
