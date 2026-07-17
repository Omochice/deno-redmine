import { expect } from "jsr:@std/expect@1.0.20";
import { buildUrl } from "./url.ts";

Deno.test("buildUrl appends segments to a bare endpoint", () => {
  expect(buildUrl("https://example.com", "projects", "1.json").href).toEqual(
    "https://example.com/projects/1.json",
  );
});

Deno.test("buildUrl keeps the scheme intact (no `https:/` collapse)", () => {
  const url = buildUrl("https://example.com", "projects.json");
  expect(url.protocol).toEqual("https:");
  expect(url.host).toEqual("example.com");
});

Deno.test("buildUrl preserves a base path for subpath installations", () => {
  expect(buildUrl("https://example.com/redmine", "projects", "1.json").href)
    .toEqual("https://example.com/redmine/projects/1.json");
});

Deno.test("buildUrl preserves a base path regardless of a trailing slash", () => {
  expect(buildUrl("https://example.com/redmine/", "projects", "1.json").href)
    .toEqual("https://example.com/redmine/projects/1.json");
});
