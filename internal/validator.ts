import {
  custom,
  number,
  object,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.1.0";

export const idName = object({
  id: number(),
  name: string(),
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
