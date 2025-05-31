import { createWithError } from "./create.ts";
import { ResultAsync } from "npm:neverthrow@8.2.0";
import { convertError } from "../error.ts";

/**
 * Create a wiki page in the project
 *
 * @param context REST endpoint context
 * @param projectId Project identifier
 * @param wiki Wiki page object
 */
export const update = ResultAsync.fromThrowable(
  createWithError,
  convertError("unknown error update a wiki page"),
);
