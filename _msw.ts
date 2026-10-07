import { HttpResponse } from "npm:msw@3.0.2";
import { defineNetwork, InterceptorSource } from "npm:msw@3.0.2/experimental";
import { FetchInterceptor } from "npm:@mswjs/interceptors@0.45.7/fetch/web";
import { STATUS_CODE } from "jsr:@std/http@1.1.4/status";

type Handler = Parameters<ReturnType<typeof defineNetwork>["use"]>[number];
type Interceptor = ConstructorParameters<
  typeof InterceptorSource
>[0]["interceptors"][number];

export function setupServer() {
  // msw/node's FetchInterceptor passes the call to the real fetch and
  // intercepts at the node:net socket layer, which Deno's native fetch
  // never goes through; the web variant intercepts the fetch call itself.
  const network = defineNetwork({
    sources: [
      new InterceptorSource({
        interceptors: [
          // msw is typed against the node build, whose Interceptor class is a
          // separate declaration from the browser build that ships this variant.
          new FetchInterceptor() as unknown as Interceptor,
        ],
      }),
    ],
    handlers: [],
    onUnhandledFrame: "warn",
    context: { quiet: true },
  });
  return {
    listen: () => void network.enable(),
    use: (...handlers: Handler[]) => network.use(...handlers),
    resetHandlers: (...handlers: Handler[]) =>
      network.resetHandlers(...handlers),
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
