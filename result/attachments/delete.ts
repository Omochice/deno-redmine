import { ResultAsync } from "npm:neverthrow@8.2.0";
import { deleteAttachment as deleteWithError } from "../../throwable/attachments/delete.ts";
import { convertError } from "../../error.ts";

export const deleteAttachment = ResultAsync.fromThrowable(
  deleteWithError,
  convertError("unknown error delete an attachment"),
);
