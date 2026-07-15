import {
  assertEquals,
  assertInstanceOf,
  assertRejects,
  assertStrictEquals,
} from "jsr:@std/assert@1.0.19";
import { assertResponse, RedmineResponseError } from "./error.ts";

Deno.test("RedmineResponseError.fromResponse captures status, statusText and body", async () => {
  const response = new Response("id is required", {
    status: 422,
    statusText: "Unprocessable Entity",
  });
  const error = await RedmineResponseError.fromResponse(response);

  assertInstanceOf(error, RedmineResponseError);
  assertEquals(error.name, "RedmineResponseError");
  assertEquals(error.status, 422);
  assertEquals(error.statusText, "Unprocessable Entity");
  assertEquals(error.body, "id is required");
  assertEquals(error.message, "Unprocessable Entity");
});

Deno.test("RedmineResponseError does not populate cause", async () => {
  const response = new Response("boom", {
    status: 500,
    statusText: "Internal Server Error",
  });
  const error = await RedmineResponseError.fromResponse(response);

  assertStrictEquals(error.cause, undefined);
});

Deno.test("RedmineResponseError.fromResponse falls back to empty body when the body is unreadable", async () => {
  const response = new Response("already read", {
    status: 500,
    statusText: "Internal Server Error",
  });
  await response.text();

  const error = await RedmineResponseError.fromResponse(response);

  assertEquals(error.body, "");
});

Deno.test("assertResponse resolves without throwing for an ok response", async () => {
  const response = new Response("ok", { status: 200 });
  await assertResponse(response);
});

Deno.test("assertResponse throws RedmineResponseError carrying the response details for a non-ok response", async () => {
  const response = new Response("not found", {
    status: 404,
    statusText: "Not Found",
  });

  const error = await assertRejects(() => assertResponse(response));
  assertInstanceOf(error, RedmineResponseError);
  assertEquals(error.status, 404);
  assertEquals(error.body, "not found");
});
