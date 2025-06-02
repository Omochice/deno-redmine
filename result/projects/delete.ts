import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteProject as deleteWithError } from "../../throwable/projects/delete.ts";
import { convertError } from "../../error.ts";

export const deleteProject = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete a project"),
);
