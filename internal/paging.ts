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
 * Options controlling how {@link walkPages} walks a paged resource.
 */
export type PagingOptions = {
  /**
   * Items requested per page. Redmine caps this at 100, so callers must not
   * exceed that ceiling.
   */
  pageSize: number;
  /**
   * Upper bound on the number of items to yield. When set, paging walks
   * sequentially and stops as soon as this many items are yielded, which
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
 * Walk every page of a Redmine list resource and yield the items in page
 * order.
 *
 * With `options.limit` set the walk is sequential and stops once enough items
 * are yielded. Without it, the first page is fetched (its reported total
 * drives how many pages remain) and later pages are read ahead with bounded
 * parallelism, so an early `break` leaves at most `concurrency` requests
 * wasted instead of fetching the whole resource.
 *
 * A page failure surfaces once iteration reaches that page, so every item
 * before it is guaranteed to have been yielded already.
 *
 * @typeParam T Element type of the list
 * @param fetchPage Fetches and parses a single page
 * @param options Page size, optional item cap, and concurrency bound
 * @returns Items across all pages, in ascending offset order
 */
export async function* walkPages<T>(
  fetchPage: FetchPage<T>,
  options: PagingOptions,
): AsyncGenerator<T> {
  if (
    !Number.isInteger(options.pageSize) ||
    options.pageSize < 1 ||
    options.pageSize > 100
  ) {
    throw new RangeError(
      `pageSize must be an integer between 1 and 100, got ${options.pageSize}`,
    );
  }
  if (options.limit !== undefined) {
    yield* walkUpToLimit(fetchPage, options.pageSize, options.limit);
    return;
  }
  yield* walkWithReadAhead(
    fetchPage,
    options.pageSize,
    Math.max(1, options.concurrency ?? DEFAULT_CONCURRENCY),
  );
}

async function* walkUpToLimit<T>(
  fetchPage: FetchPage<T>,
  pageSize: number,
  limit: number,
): AsyncGenerator<T> {
  let count = 0;
  while (count < limit) {
    const fetchSize = Math.min(pageSize, limit - count);
    const page = await fetchPage(fetchSize, count);
    for (const item of page.items) {
      yield item;
      count++;
      // Guards against a server returning more items than requested pushing
      // the walk past the cap.
      if (count >= limit) {
        return;
      }
    }
    // A short page means the resource is exhausted, so there is nothing left
    // to walk even though the requested limit is not yet reached.
    if (page.items.length < fetchSize) {
      return;
    }
  }
}

type SettledPage<T> =
  | { ok: true; page: Page<T> }
  | { ok: false; error: unknown };

async function* walkWithReadAhead<T>(
  fetchPage: FetchPage<T>,
  pageSize: number,
  concurrency: number,
): AsyncGenerator<T> {
  // The first full page also reports total_count, so no separate probe request
  // is needed.
  const first = await fetchPage(pageSize, 0);
  yield* first.items;
  const offsets: number[] = [];
  for (let offset = pageSize; offset < first.totalCount; offset += pageSize) {
    offsets.push(offset);
  }
  let next = 0;
  let current = 0;
  const inflight = new Map<number, Promise<SettledPage<T>>>();
  const settle = (index: number): Promise<SettledPage<T>> => {
    // Read-ahead promises must never reject: a rejection settling while
    // iteration is still consuming earlier pages (or after the consumer
    // broke out) would be detected as unhandled. Failures are carried as
    // values instead and re-thrown once iteration reaches the failing page.
    try {
      return fetchPage(pageSize, offsets[index]).then(
        (page) => ({ ok: true as const, page }),
        (error) => ({ ok: false as const, error }),
      );
    } catch (error) {
      // A synchronously throwing fetchPage would otherwise escape the settle
      // wrapping and surface out of order, before earlier pages are yielded.
      return Promise.resolve({ ok: false as const, error });
    }
  };
  const fill = () => {
    while (inflight.size < concurrency && next < offsets.length) {
      inflight.set(next, settle(next));
      next++;
    }
  };
  fill();
  // Awaiting pages in index order keeps yields ordered and makes a failing
  // page surface only after every earlier item has been yielded, regardless
  // of the order in which the read-ahead requests settle.
  while (current < offsets.length) {
    const settled = await inflight.get(current)!;
    inflight.delete(current);
    current++;
    if (!settled.ok) {
      throw settled.error;
    }
    fill();
    yield* settled.page.items;
  }
}
