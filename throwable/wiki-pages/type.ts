export type Wiki = {
  title: string;
  version: number;
  createdOn: Date;
  updatedOn: Date;
  parent?: {
    title: string;
  };
};

export type WikiDetail = {
  title: string;
  version: number;
  text: string;
  author: Author;
  comments?: string;
  createdOn: Date;
  updatedOn: Date;
  attachments?: Attachment[];
};

type Author = {
  id: number;
  name: string;
};

type Attachment = {
  id: number;
  filename: string;
};

export type WikiContent = {
  title: string;
  text: string;
  comments?: string;
  version?: number;
  parentTitle?: string;
};

/** Characters that cannot be used in wiki title */
const bannedCharacters = new Set([".", "/", "?", ";", ":", "|", " "]);

/**
 * Sanitize wiki title
 *
 * @param title sanitize target
 * @returns Sanitized one
 */
export function sanitizeTitle(title: string): string {
  return bannedCharacters.values().toArray().reduce(
    (t, s) => t.replaceAll(s, "_"),
    title,
  );
}
