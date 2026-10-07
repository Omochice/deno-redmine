export { setupServer } from "npm:msw@3.0.2/node";
import { HttpResponse } from "npm:msw@3.0.2";
import { STATUS_CODE } from "jsr:@std/http@1.1.4/status";

export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

export function notFound() {
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
