import { HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.4/status";

/** Response for a request the Redmine API rejects as invalid. */
export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

/** Response for a resource the Redmine API reports as missing. */
export function notFound() {
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
