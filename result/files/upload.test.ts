import { upload } from "./upload.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import { context, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

const server = setupServer();
server.listen();

Deno.test("POST /uploads.json", async (t) => {
  await t.step("if got 201, should return the upload token", async () => {
    server.resetHandlers(...validHandlers);
    const e = await upload(context, new TextEncoder().encode("content"));
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap()).toEqual("7167.ed1ccdb093229ca1bd0b043618d88743");
  });

  await t.step(
    "should send the filename as a query parameter and octet-stream body",
    async () => {
      let capturedUrl: string | undefined;
      let capturedContentType: string | null | undefined;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/uploads.json`,
          ({ request }) => {
            capturedUrl = request.url;
            capturedContentType = request.headers.get("Content-Type");
            return HttpResponse.json({ upload: { token: "token" } });
          },
        ),
      );
      const e = await upload(
        context,
        new TextEncoder().encode("content"),
        "foo.zip",
      );
      expect(e.isOk()).toBe(true);
      expect(new URL(capturedUrl!).searchParams.get("filename")).toEqual(
        "foo.zip",
      );
      expect(capturedContentType).toEqual("application/octet-stream");
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.resetHandlers(
        http.post(`${context.endpoint}/uploads.json`, () => {
          return HttpResponse.json({
            errors: ["sample error"],
          }, {
            // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
            status: STATUS_CODE.UnprocessableEntity,
            statusText: "Unprocessable Entity",
          });
        }),
      );
      const e = await upload(context, new TextEncoder().encode("content"));
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.resetHandlers(
      http.post(`${context.endpoint}/uploads.json`, () => {
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
        return new HttpResponse(null, { status: STATUS_CODE.NotFound });
      }),
    );
    const e = await upload(context, new TextEncoder().encode("content"));
    expect(e.isErr()).toBe(true);
  });
});
