import { expect } from "jsr:@std/expect@1.0.20";
import { fetchAllPages, type Page } from "./paging.ts";

const nextTick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let value = start; value < end; value++) {
    values.push(value);
  }
  return values;
}

// A finite source of ascending integers, returning at most `limit` of them
// from `offset` and reporting the fixed total.
function finiteSource(
  total: number,
): (limit: number, offset: number) => Promise<Page<number>> {
  return (limit, offset) =>
    Promise.resolve({
      items: range(offset, Math.min(offset + limit, total)),
      totalCount: total,
    });
}

Deno.test("aggregates every page in ascending offset order", async () => {
  const result = await fetchAllPages(finiteSource(23), { pageSize: 10 });
  expect(result).toEqual(range(0, 23));
});

Deno.test("returns an empty result without fetching data pages when the total is zero", async () => {
  const offsets: number[] = [];
  const result = await fetchAllPages(
    (_limit, offset) => {
      offsets.push(offset);
      return Promise.resolve({ items: [] as number[], totalCount: 0 });
    },
    { pageSize: 10 },
  );
  expect(result).toEqual([]);
  expect(offsets).toEqual([0]);
});

Deno.test("keeps offset order even when later pages settle first", async () => {
  const result = await fetchAllPages(
    async (limit, offset) => {
      // Earlier offsets resolve last, so a naive push-on-settle would reorder.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, offset === 0 ? 5 : 1)
      );
      return { items: range(offset, offset + limit), totalCount: 30 };
    },
    { pageSize: 10, concurrency: 6 },
  );
  expect(result).toEqual(range(0, 30));
});

Deno.test("never exceeds the concurrency bound for data pages", async () => {
  let inFlight = 0;
  let maxInFlight = 0;
  const result = await fetchAllPages(
    async (limit, offset) => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await nextTick();
      inFlight--;
      return {
        items: range(offset, Math.min(offset + limit, 100)),
        totalCount: 100,
      };
    },
    { pageSize: 10, concurrency: 3 },
  );
  expect(result).toEqual(range(0, 100));
  expect(maxInFlight).toEqual(3);
});

Deno.test("fetches a single page when the total fits within one page", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await fetchAllPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, Math.min(offset + limit, 5)),
        totalCount: 5,
      });
    },
    { pageSize: 10 },
  );
  expect(result).toEqual(range(0, 5));
  expect(calls).toEqual([{ limit: 10, offset: 0 }]);
});

Deno.test("rejects a pageSize outside Redmine's 1-to-100 range", async () => {
  // Above 100 Redmine clamps each page while the offset walk advances by the
  // full pageSize, which would silently skip records; at or below zero the walk
  // cannot advance.
  for (const pageSize of [0, -1, 101, 10.5]) {
    await expect(fetchAllPages(finiteSource(50), { pageSize })).rejects
      .toThrow(RangeError);
  }
});

Deno.test("clamps a non-positive concurrency to at least one", async () => {
  // Without clamping, zero workers would silently drop every page after the
  // first, and a negative value would throw on `Array.from`.
  const result = await fetchAllPages(finiteSource(30), {
    pageSize: 10,
    concurrency: 0,
  });
  expect(result).toEqual(range(0, 30));
});

Deno.test("stops at the requested limit and slices off the over-fetch", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await fetchAllPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, offset + limit),
        totalCount: 9999,
      });
    },
    { pageSize: 100, limit: 250 },
  );
  expect(result).toEqual(range(0, 250));
  // No count probe; the last page requests only the remaining 50 items.
  expect(calls).toEqual([
    { limit: 100, offset: 0 },
    { limit: 100, offset: 100 },
    { limit: 50, offset: 200 },
  ]);
});

Deno.test("stops early when the source is exhausted before the limit", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await fetchAllPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, Math.min(offset + limit, 30)),
        totalCount: 30,
      });
    },
    { pageSize: 100, limit: 250 },
  );
  expect(result).toEqual(range(0, 30));
  expect(calls).toEqual([{ limit: 100, offset: 0 }]);
});
