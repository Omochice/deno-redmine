import { join } from "jsr:@std/path@1.1.6/posix/join";

/**
 * Build a request URL by appending path segments to the endpoint's path.
 *
 * @param endpoint Base REST endpoint, which may include a base path for subpath installations (e.g. `https://example.com/redmine`)
 * @param segments Path segments to append
 * @returns The resolved URL
 *
 * @example Usage
 * ```ts
 * import { buildUrl } from "./url.ts";
 * import { assertEquals } from "jsr:@std/assert";
 *
 * assertEquals(
 *   buildUrl("https://example.com/redmine", "projects", "1.json").href,
 *   "https://example.com/redmine/projects/1.json",
 * );
 * ```
 */
export function buildUrl(endpoint: string, ...segments: string[]): URL {
  const url = new URL(endpoint);
  // `join` is applied to `pathname` alone rather than the whole endpoint so
  // that the scheme and host are never touched. Joining the full URL string
  // would collapse `https://` to `https:/` and only work because http/https
  // are special schemes that `new URL()` re-normalizes; a base path such as
  // `/redmine` also survives correctly this way.
  url.pathname = join(url.pathname, ...segments);
  return url;
}
