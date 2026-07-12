import { assertEquals } from "jsr:@std/assert@1.0.19";
import { buildUrl } from "./url.ts";

Deno.test("buildUrl appends segments to a bare endpoint", () => {
  assertEquals(
    buildUrl("https://example.com", "projects", "1.json").href,
    "https://example.com/projects/1.json",
  );
});

Deno.test("buildUrl keeps the scheme intact (no `https:/` collapse)", () => {
  const url = buildUrl("https://example.com", "projects.json");
  assertEquals(url.protocol, "https:");
  assertEquals(url.host, "example.com");
});

Deno.test("buildUrl preserves a base path for subpath installations", () => {
  assertEquals(
    buildUrl("https://example.com/redmine", "projects", "1.json").href,
    "https://example.com/redmine/projects/1.json",
  );
});

Deno.test("buildUrl preserves a base path regardless of a trailing slash", () => {
  assertEquals(
    buildUrl("https://example.com/redmine/", "projects", "1.json").href,
    "https://example.com/redmine/projects/1.json",
  );
});
