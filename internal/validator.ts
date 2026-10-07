import {
  custom,
  number,
  object,
  optional,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.5.0";

export const idName = object({
  id: number(),
  name: string(),
});

export const upload = object({
  token: string(),
  filename: optional(string()),
  contentType: optional(string()),
  description: optional(string()),
});

export const dateLikeString = pipe(
  string(),
  custom((input) => {
    if (typeof input !== "string") {
      return false;
    }
    return !isNaN(Date.parse(input));
  }),
  transform((input) => new Date(input)),
);

export function toUndefined<T>(input: T | null | undefined): T | undefined {
  return input ?? undefined;
}
