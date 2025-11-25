import {
  array,
  custom,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.2.0";
import type { SnakeCasedProperties } from "npm:type-fest@5.2.0";
import {
  sanitizeTitle,
  type Wiki,
  type WikiContent,
  type WikiDetail,
} from "./type.ts";
// NOTE: replace valibot.toCamelCase when implements it
import { objectToCamel } from "npm:ts-case-convert@2.1.0";

const dateLikeString = pipe(
  string(),
  custom((input) => {
    if (typeof input !== "string") {
      return false;
    }
    return !isNaN(Date.parse(input));
  }),
  transform((input: string) => new Date(input)),
);

const inputWiki = object({
  wiki_pages: array(object({
    title: string(),
    version: number(),
    created_on: dateLikeString,
    updated_on: dateLikeString,
    parent: optional(
      object({
        title: string(),
      }),
    ),
  })),
});

/**
 * Validate that it is wiki object
 */
export const wikis = pipe(
  inputWiki,
  transform((input) => {
    return input.wiki_pages
      .map((w) => {
        return objectToCamel(w) satisfies Wiki;
      });
  }),
);

const idName = object({
  id: number(),
  name: string(),
});

const inputWikiDetail = object({
  wiki_page: object({
    title: string(),
    version: number(),
    text: string(),
    author: idName,
    comments: string(),
    created_on: dateLikeString,
    updated_on: dateLikeString,
    attachments: optional(
      array(object({
        id: number(),
        filename: string(),
      })),
    ),
  }),
});

/**
 * Validate that it is detailed wiki object
 */
export const wikiDetail = pipe(
  inputWikiDetail,
  transform((input) => {
    return objectToCamel(input.wiki_page) satisfies WikiDetail;
  }),
);

/**
 * Make wiki content to object for create/update
 *
 * @param wiki Wiki content
 * @returns Converted one
 */
export function makeWikiPutRequest(wiki: WikiContent) {
  const page = {
    text: wiki.text,
    comments: wiki.comments,
    version: wiki.version,
    parent_title: wiki.parentTitle == null
      ? undefined
      : sanitizeTitle(wiki.parentTitle),
  } satisfies Omit<SnakeCasedProperties<WikiContent>, "title">;
  return { wiki_page: page };
}
