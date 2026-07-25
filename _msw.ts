import { HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

export function notFound() {
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
