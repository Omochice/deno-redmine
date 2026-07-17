import { expect } from "jsr:@std/expect@1.0.20";
import { assertResponse, RedmineResponseError } from "./error.ts";

Deno.test("RedmineResponseError.fromResponse captures status, statusText and body", async () => {
  const response = new Response("id is required", {
    status: 422,
    statusText: "Unprocessable Entity",
  });
  const error = await RedmineResponseError.fromResponse(response);

  expect(error).toBeInstanceOf(RedmineResponseError);
  expect(error.name).toEqual("RedmineResponseError");
  expect(error.status).toEqual(422);
  expect(error.statusText).toEqual("Unprocessable Entity");
  expect(error.body).toEqual("id is required");
  expect(error.message).toEqual("Unprocessable Entity");
});

Deno.test("RedmineResponseError falls back to the status code when statusText is empty", async () => {
  const response = new Response("boom", { status: 500, statusText: "" });
  const error = await RedmineResponseError.fromResponse(response);

  expect(error.message).toEqual("HTTP 500");
});

Deno.test("RedmineResponseError does not populate cause", async () => {
  const response = new Response("boom", {
    status: 500,
    statusText: "Internal Server Error",
  });
  const error = await RedmineResponseError.fromResponse(response);

  expect(error.cause).toBe(undefined);
});

Deno.test("RedmineResponseError.fromResponse falls back to empty body when the body is unreadable", async () => {
  const response = new Response("already read", {
    status: 500,
    statusText: "Internal Server Error",
  });
  await response.text();

  const error = await RedmineResponseError.fromResponse(response);

  expect(error.body).toEqual("");
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

  let error: unknown;
  try {
    await assertResponse(response);
  } catch (e) {
    error = e;
  }
  expect(error).toBeInstanceOf(RedmineResponseError);
  expect((error as RedmineResponseError).status).toEqual(404);
  expect((error as RedmineResponseError).body).toEqual("not found");
});
