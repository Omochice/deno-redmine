import { HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

export function notFound() {
  // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
