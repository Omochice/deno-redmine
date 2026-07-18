import {
  array,
  number,
  object,
  optional,
  partial,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import type { News, ShowNews } from "./type.ts";
import { dateLikeString, idName } from "../../internal/validator.ts";
import { attachmentSchema } from "../attachments/validator.ts";
import { objectToCamel, objectToSnake } from "npm:ts-case-convert@2.3.1";

const newsSchema = pipe(
  object({
    id: number(),
    project: idName,
    author: idName,
    title: string(),
    summary: string(),
    description: string(),
    created_on: dateLikeString,
  }),
  transform((input) => {
    return objectToCamel(input) satisfies News;
  }),
);

export const listNewsResponse = object({
  news: array(newsSchema),
});

const commentSchema = object({
  id: number(),
  author: optional(idName),
  content: string(),
});

const showNewsSchema = pipe(
  object({
    id: number(),
    project: idName,
    author: idName,
    title: string(),
    summary: optional(string()),
    description: string(),
    created_on: dateLikeString,
    attachments: optional(array(attachmentSchema)),
    comments: optional(array(commentSchema)),
  }),
  transform((input) => {
    return objectToCamel(input) satisfies ShowNews;
  }),
);

export const showNewsResponse = object({
  news: showNewsSchema,
});

const createNewsQuerySchema = object({
  title: string(),
  description: string(),
  summary: optional(string()),
  uploads: optional(array(object({
    token: string(),
    filename: optional(string()),
    contentType: optional(string()),
    description: optional(string()),
  }))),
});

export const toCreateNewsQuery = pipe(
  createNewsQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);

export const toUpdateNewsQuery = pipe(
  partial(createNewsQuerySchema),
  transform((input) => {
    return objectToSnake(input);
  }),
);
