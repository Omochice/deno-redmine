import {
  boolean,
  object,
  optional,
  pipe,
  string,
  transform,
} from "jsr:@valibot/valibot@1.4.2";
import { objectToSnake } from "npm:ts-case-convert@2.3.1";

const updateJournalQuerySchema = object({
  notes: optional(string()),
  privateNotes: optional(boolean()),
});

export const toUpdateJournalQuery = pipe(
  updateJournalQuerySchema,
  transform((input) => {
    return objectToSnake(input);
  }),
);
