import {
  type InferOutput,
  nullable,
  number,
  object,
  string,
} from "jsr:@valibot/valibot@1.1.0";

export const trackerSchema = object({
  id: number(),
  name: string(),
  default_status: object({
    id: number(),
    name: string(),
  }),
  description: nullable(string()),
});

export type Tracker = InferOutput<typeof trackerSchema>;
