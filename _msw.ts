import { HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

/**
 * A 422 Unprocessable Entity response carrying a Redmine-style error body.
 *
 * Shared by the module mocks so the msw `HttpResponseInit` type conflict is
 * suppressed in exactly one place instead of at every error handler.
 */
export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

/**
 * A 404 Not Found response with an empty body.
 */
export function notFound() {
  return HttpResponse.json({}, {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    status: STATUS_CODE.NotFound,
  });
}
