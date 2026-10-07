import { HttpResponse } from "npm:msw@3.0.2";
import { defineNetwork, InterceptorSource } from "npm:msw@3.0.2/experimental";
import { FetchInterceptor } from "npm:@mswjs/interceptors@0.45.7/fetch/web";
import { STATUS_CODE } from "jsr:@std/http@1.1.4/status";

export function setupServer() {
  const network = defineNetwork({
    sources: [
      new InterceptorSource({
        interceptors: [new FetchInterceptor() as never],
      }),
    ],
    handlers: [],
    onUnhandledFrame: "warn",
    context: { quiet: true },
  });
  return {
    listen: network.enable,
    use: network.use,
    resetHandlers: network.resetHandlers,
  };
}

export function unprocessableEntity() {
  return HttpResponse.json({ errors: ["sample error"] }, {
    status: STATUS_CODE.UnprocessableEntity,
    statusText: "Unprocessable Entity",
  });
}

export function notFound() {
  return new HttpResponse(null, { status: STATUS_CODE.NotFound });
}
