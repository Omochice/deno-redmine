/**
 * One page of a Redmine list response, reduced to what paging needs.
 */
export type Page<T> = {
  /** Items contained in this page. */
  items: T[];
  /** Total number of items across every page, as reported by Redmine. */
  totalCount: number;
};

/**
 * Fetch a single page for a given page size and offset.
 *
 * Implementations own the request and its parsing; the paging helper only
 * decides which `(limit, offset)` pairs to request and in what order to
 * aggregate the results.
 */
export type FetchPage<T> = (limit: number, offset: number) => Promise<Page<T>>;

/**
 * Options controlling how {@link fetchAllPages} walks a paged resource.
 */
export type PagingOptions = {
  /**
   * Items requested per page. Redmine caps this at 100, so callers must not
   * exceed that ceiling.
   */
  pageSize: number;
  /**
   * Upper bound on the number of items to return. When set, paging walks
   * sequentially and stops as soon as this many items are collected, which
   * skips the `total_count` probe and avoids over-fetching the final page.
   */
  limit?: number;
  /**
   * Maximum number of page requests in flight at once when no `limit` is set.
   * Defaults to {@link DEFAULT_CONCURRENCY}.
   */
  concurrency?: number;
};

// HTTP/1.1 keeps around six connections per host, so more in-flight requests
// than this queue at the transport without adding real parallelism while still
// pressuring Redmine. Six saturates that budget without going over it.
const DEFAULT_CONCURRENCY = 6;

/**
 * Walk every page of a Redmine list resource and return the aggregated items
 * in page order.
 *
 * With `options.limit` set the walk is sequential and stops once enough items
 * are collected. Without it, the first page is fetched (its reported total
 * drives how many pages remain) and the rest are fetched with bounded
 * parallelism.
 *
 * @typeParam T Element type of the list
 * @param fetchPage Fetches and parses a single page
 * @param options Page size, optional item cap, and concurrency bound
 * @returns Every item across all pages, in ascending offset order
 */
export async function fetchAllPages<T>(
  fetchPage: FetchPage<T>,
  options: PagingOptions,
): Promise<T[]> {
  if (options.limit !== undefined) {
    return await collectUpToLimit(fetchPage, options.pageSize, options.limit);
  }
  return await collectAll(
    fetchPage,
    options.pageSize,
    Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY),
  );
}

async function collectUpToLimit<T>(
  fetchPage: FetchPage<T>,
  pageSize: number,
  limit: number,
): Promise<T[]> {
  const items: T[] = [];
  while (items.length < limit) {
    const fetchSize = Math.min(pageSize, limit - items.length);
    const page = await fetchPage(fetchSize, items.length);
    items.push(...page.items);
    // A short page means the resource is exhausted, so there is nothing left
    // to walk even though the requested limit is not yet reached.
    if (page.items.length < fetchSize) {
      break;
    }
  }
  return items.slice(0, limit);
}

async function collectAll<T>(
  fetchPage: FetchPage<T>,
  pageSize: number,
  concurrency: number,
): Promise<T[]> {
  // The first full page also reports total_count, so no separate probe request
  // is needed.
  const first = await fetchPage(pageSize, 0);
  if (first.totalCount <= pageSize) {
    return first.items;
  }
  const offsets: number[] = [];
  for (let offset = pageSize; offset < first.totalCount; offset += pageSize) {
    offsets.push(offset);
  }
  // Results are written back at their page index so aggregation order is
  // independent of the order in which concurrent requests settle.
  const pages: T[][] = new Array(offsets.length);
  let next = 0;
  const worker = async (): Promise<void> => {
    // `next++` reads and advances synchronously before any await, so each
    // worker claims a distinct index without further coordination.
    for (let index = next++; index < offsets.length; index = next++) {
      pages[index] = (await fetchPage(pageSize, offsets[index])).items;
    }
  };
  const workers = Array.from(
    { length: Math.min(concurrency, offsets.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return [first.items, ...pages].flat();
}
