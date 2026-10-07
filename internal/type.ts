export type IdName = {
  id: number;
  name: string;
};

/** A file uploaded with `files.upload`, to attach to a resource. */
export type Upload = {
  /** The token returned by `files.upload`. */
  token: string;
  filename?: string;
  contentType?: string;
  description?: string;
};
