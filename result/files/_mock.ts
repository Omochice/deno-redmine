import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/projects/:id/files.json`, () => {
    const files = [
      {
        id: 12,
        filename: "foo.zip",
        filesize: 12345,
        content_type: "application/zip",
        content_url:
          "http://redmine.example.com/attachments/download/12/foo.zip",
        description: "A dummy attachment",
        version: { id: 3, name: "v1.0" },
        digest: "abcd1234",
        downloads: 5,
        author: { id: 1, name: "John Smith" },
        created_on: "2026-07-13T00:00:00.000Z",
      },
      {
        id: 13,
        filename: "bar.txt",
        filesize: 42,
        content_type: "text/plain",
        content_url:
          "http://redmine.example.com/attachments/download/13/bar.txt",
        description: null,
        digest: "ef567890",
        downloads: 0,
        author: { id: 1, name: "John Smith" },
        created_on: "2026-07-12T00:00:00.000Z",
      },
    ] as const;
    return HttpResponse.json({ files });
  }),
  http.post(`${context.endpoint}/uploads.json`, () => {
    return HttpResponse.json({
      upload: { token: "7167.ed1ccdb093229ca1bd0b043618d88743" },
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.Created,
    });
  }),
  http.post(`${context.endpoint}/projects/:id/files.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/projects/422/files.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/projects/404/files.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.post(`${context.endpoint}/projects/422/files.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.post(`${context.endpoint}/projects/404/files.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
];
