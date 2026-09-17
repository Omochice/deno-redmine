import type { Context } from "../context.ts";
import { show } from "./show.ts";
import { download } from "./download.ts";
import type { UpdateAttachmentQuery } from "./type.ts";
import { update } from "./update.ts";
import { deleteAttachment } from "./delete.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns the attachment of given id.
   *
   * @param id Attachment identifier
   */
  show(id: number): ReturnType<typeof show> {
    return show(this.#context, id);
  }

  /**
   * Downloads the content of the attachment of given id.
   *
   * @param id Attachment identifier
   */
  download(id: number): ReturnType<typeof download> {
    return download(this.#context, id);
  }

  /**
   * Updates the attachment of given id.
   *
   * @param id Attachment identifier
   * @param attachment The attachment attributes to update it
   */
  update(
    id: number,
    attachment: UpdateAttachmentQuery,
  ): ReturnType<typeof update> {
    return update(this.#context, id, attachment);
  }

  /**
   * Deletes the attachment of given id.
   *
   * @param id Attachment identifier
   */
  delete(id: number): ReturnType<typeof deleteAttachment> {
    return deleteAttachment(this.#context, id);
  }
}
