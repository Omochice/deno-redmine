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
  // Join only the pathname: joining the whole endpoint collapses `https://`
  // to `https:/`, which merely works by relying on `new URL()` re-normalizing
  // the special scheme back.
  url.pathname = join(url.pathname, ...segments);
  return url;
}
