import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

const newsItems = [
  {
    id: 1,
    project: { id: 1, name: "Demo" },
    author: { id: 2, name: "John Smith" },
    title: "News title",
    summary: "News summary",
    description: "News description",
    created_on: "2026-07-13T00:00:00.000Z",
  },
  {
    id: 2,
    project: { id: 1, name: "Demo" },
    author: { id: 3, name: "Jane Doe" },
    title: "Another news",
    summary: "Another summary",
    description: "Another description",
    created_on: "2026-07-12T00:00:00.000Z",
  },
] as const;

const attachments = [
  {
    id: 7,
    filename: "note.txt",
    filesize: 12,
    content_type: "text/plain",
    description: "attached note",
    content_url: "http://redmine.example.com/attachments/download/7/note.txt",
    author: { id: 2, name: "John Smith" },
    created_on: "2026-07-13T00:00:00.000Z",
  },
] as const;

const comments = [
  { id: 11, author: { id: 3, name: "Jane Doe" }, content: "Nice news" },
] as const;

export const validHandlers = [
  http.get(`${context.endpoint}/news.json`, () => {
    return HttpResponse.json({ news: newsItems });
  }),
  http.get(`${context.endpoint}/projects/:id/news.json`, () => {
    return HttpResponse.json({ news: newsItems });
  }),
  http.get(`${context.endpoint}/news/:id.json`, ({ request, params }) => {
    const include =
      new URL(request.url).searchParams.get("include")?.split(",") ??
        [];
    return HttpResponse.json({
      news: {
        id: Number(params.id),
        project: { id: 1, name: "Demo" },
        author: { id: 2, name: "John Smith" },
        title: "News title",
        summary: "News summary",
        description: "News description",
        created_on: "2026-07-13T00:00:00.000Z",
        ...(include.includes("attachments") ? { attachments } : {}),
        ...(include.includes("comments") ? { comments } : {}),
      },
    });
  }),
  http.post(`${context.endpoint}/projects/:id/news.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/news/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/news/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/news.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/projects/422/news.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/projects/404/news.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.get(`${context.endpoint}/news/404.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.post(`${context.endpoint}/projects/422/news.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.put(`${context.endpoint}/news/422.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.delete(`${context.endpoint}/news/404.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
];
