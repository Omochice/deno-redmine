import { expect } from "jsr:@std/expect@1.0.20";
import { type Page, walkPages } from "./paging.ts";

const nextTick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let value = start; value < end; value++) {
    values.push(value);
  }
  return values;
}

function finiteSource(
  total: number,
): (limit: number, offset: number) => Promise<Page<number>> {
  return (limit, offset) =>
    Promise.resolve({
      items: range(offset, Math.min(offset + limit, total)),
      totalCount: total,
    });
}

Deno.test("yields every item in ascending offset order", async () => {
  const result = await Array.fromAsync(
    walkPages(finiteSource(23), { pageSize: 10 }),
  );
  expect(result).toStrictEqual(range(0, 23));
});

Deno.test("yields nothing without fetching data pages when the total is zero", async () => {
  const offsets: number[] = [];
  const result = await Array.fromAsync(walkPages(
    (_limit, offset) => {
      offsets.push(offset);
      return Promise.resolve({ items: [] as number[], totalCount: 0 });
    },
    { pageSize: 10 },
  ));
  expect(result).toStrictEqual([]);
  expect(offsets).toStrictEqual([0]);
});

Deno.test("keeps offset order even when later pages settle first", async () => {
  const result = await Array.fromAsync(walkPages(
    async (limit, offset) => {
      // Earlier offsets resolve last, so a naive yield-on-settle would
      // reorder.
      await new Promise<void>((resolve) =>
        setTimeout(resolve, offset === 0 ? 5 : 1)
      );
      return { items: range(offset, offset + limit), totalCount: 30 };
    },
    { pageSize: 10, concurrency: 6 },
  ));
  expect(result).toStrictEqual(range(0, 30));
});

Deno.test("never exceeds the concurrency bound for data pages", async () => {
  let inFlight = 0;
  let maxInFlight = 0;
  const result = await Array.fromAsync(walkPages(
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
  ));
  expect(result).toStrictEqual(range(0, 100));
  expect(maxInFlight).toStrictEqual(3);
});

Deno.test("fetches a single page when the total fits within one page", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await Array.fromAsync(walkPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, Math.min(offset + limit, 5)),
        totalCount: 5,
      });
    },
    { pageSize: 10 },
  ));
  expect(result).toStrictEqual(range(0, 5));
  expect(calls).toStrictEqual([{ limit: 10, offset: 0 }]);
});

Deno.test("rejects a pageSize outside Redmine's 1-to-100 range on first iteration", async () => {
  // Above 100 Redmine clamps each page while the offset walk advances by the
  // full pageSize, which would silently skip records; at or below zero the walk
  // cannot advance.
  for (const pageSize of [0, -1, 101, 10.5]) {
    const pages = walkPages(finiteSource(50), { pageSize });
    await expect(pages.next()).rejects.toThrow(RangeError);
  }
});

Deno.test("clamps a non-positive concurrency to at least one", async () => {
  // Without clamping, zero in-flight slots would make the walk await pages
  // that were never requested.
  const result = await Array.fromAsync(walkPages(finiteSource(30), {
    pageSize: 10,
    concurrency: 0,
  }));
  expect(result).toStrictEqual(range(0, 30));
});

Deno.test("stops at the requested limit without over-fetching", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await Array.fromAsync(walkPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, offset + limit),
        totalCount: 9999,
      });
    },
    { pageSize: 100, limit: 250 },
  ));
  expect(result).toStrictEqual(range(0, 250));
  // No count probe; the last page requests only the remaining 50 items.
  expect(calls).toStrictEqual([
    { limit: 100, offset: 0 },
    { limit: 100, offset: 100 },
    { limit: 50, offset: 200 },
  ]);
});

Deno.test("stops early when the source is exhausted before the limit", async () => {
  const calls: Array<{ limit: number; offset: number }> = [];
  const result = await Array.fromAsync(walkPages(
    (limit, offset) => {
      calls.push({ limit, offset });
      return Promise.resolve({
        items: range(offset, Math.min(offset + limit, 30)),
        totalCount: 30,
      });
    },
    { pageSize: 100, limit: 250 },
  ));
  expect(result).toStrictEqual(range(0, 30));
  expect(calls).toStrictEqual([{ limit: 100, offset: 0 }]);
});

Deno.test("fetches nothing beyond the first page when the consumer breaks inside it", async () => {
  const calls: number[] = [];
  const source = finiteSource(100);
  const counted: typeof source = (limit, offset) => {
    calls.push(offset);
    return source(limit, offset);
  };
  const collected: number[] = [];
  for await (const item of walkPages(counted, { pageSize: 10 })) {
    collected.push(item);
    if (collected.length >= 10) {
      break;
    }
  }
  expect(collected).toStrictEqual(range(0, 10));
  expect(calls).toStrictEqual([0]);
});

Deno.test("wastes at most the read-ahead window when the consumer breaks later", async () => {
  const calls: number[] = [];
  const source = finiteSource(100);
  const counted: typeof source = (limit, offset) => {
    calls.push(offset);
    return source(limit, offset);
  };
  const collected: number[] = [];
  for await (
    const item of walkPages(counted, { pageSize: 10, concurrency: 3 })
  ) {
    collected.push(item);
    if (collected.length >= 11) {
      break;
    }
  }
  expect(collected).toStrictEqual(range(0, 11));
  // First page, the initial window of three, and the one refill that replaces
  // the consumed page; the remaining five pages are never requested.
  expect(calls).toStrictEqual([0, 10, 20, 30, 40]);
});

Deno.test("surfaces a page failure only after every earlier item is yielded", async () => {
  const collected: number[] = [];
  await expect((async () => {
    const pages = walkPages<number>(
      async (limit, offset) => {
        if (offset === 20) {
          throw new Error("page 20 failed");
        }
        // The failing page settles first; ordered surfacing must still deliver
        // the whole preceding page.
        await new Promise<void>((resolve) => setTimeout(resolve, 5));
        return {
          items: range(offset, Math.min(offset + limit, 30)),
          totalCount: 30,
        };
      },
      { pageSize: 10 },
    );
    for await (const item of pages) {
      collected.push(item);
    }
  })()).rejects.toThrow("page 20 failed");
  expect(collected).toStrictEqual(range(0, 20));
});

Deno.test("surfaces a synchronously thrown page failure in order too", async () => {
  const collected: number[] = [];
  await expect((async () => {
    const pages = walkPages<number>(
      (limit, offset) => {
        if (offset === 20) {
          throw new Error("page 20 failed");
        }
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                items: range(offset, Math.min(offset + limit, 30)),
                totalCount: 30,
              }),
            5,
          )
        );
      },
      { pageSize: 10 },
    );
    for await (const item of pages) {
      collected.push(item);
    }
  })()).rejects.toThrow("page 20 failed");
  expect(collected).toStrictEqual(range(0, 20));
});

Deno.test("leaves no unhandled rejection behind when the consumer stops early", async () => {
  // Read-ahead pages that reject after the consumer breaks would surface as
  // unhandled rejections and crash the test run if the generator did not
  // capture them.
  const collected: number[] = [];
  for await (
    const item of walkPages<number>(
      (limit, offset) => {
        if (offset === 0) {
          return Promise.resolve({
            items: range(0, limit),
            totalCount: 40,
          });
        }
        return new Promise((_resolve, reject) =>
          setTimeout(() => reject(new Error(`page ${offset} failed`)), 1)
        );
      },
      { pageSize: 10 },
    )
  ) {
    collected.push(item);
    if (collected.length >= 10) {
      break;
    }
  }
  await new Promise<void>((resolve) => setTimeout(resolve, 10));
  expect(collected).toStrictEqual(range(0, 10));
});
