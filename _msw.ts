import { HttpResponse } from "npm:msw@3.0.1";
import { STATUS_CODE } from "jsr:@std/http@1.1.3/status";

export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

export function notFound() {
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
