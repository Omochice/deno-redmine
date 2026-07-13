import type { Context } from "../../context.ts";
import { fetchList } from "./list.ts";
import { create } from "./create.ts";
import { upload } from "./upload.ts";
import type { CreateFileQuery } from "./type.ts";

export class Client {
  readonly #context: Context;

  constructor(context: Context) {
    this.#context = context;
  }

  /**
   * Returns all files attached to the project.
   *
   * @param projectId Project identifier
   */
  list(projectId: number): ReturnType<typeof fetchList> {
    return fetchList(this.#context, projectId);
  }

  /**
   * Creates a file for the project from a previously uploaded token.
   *
   * @param projectId Project identifier
   * @param file The file attributes, including the upload token
   */
  create(
    projectId: number,
    file: CreateFileQuery,
  ): ReturnType<typeof create> {
    return create(this.#context, projectId, file);
  }

  /**
   * Uploads file content and returns a token to attach it to a resource.
   *
   * @param data File content to upload
   * @param filename Name recorded for the uploaded file
   */
  upload(
    data: Uint8Array | ReadableStream<Uint8Array>,
    filename?: string,
  ): ReturnType<typeof upload> {
    return upload(this.#context, data, filename);
  }
}
