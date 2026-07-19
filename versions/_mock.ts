import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/projects/:id/versions.json`, () => {
    const versions = [
      {
        id: 3,
        project: { id: 1, name: "Demo" },
        name: "v1.0",
        description: "",
        status: "open",
        due_date: "2026-08-01",
        sharing: "none",
        wiki_page_title: "",
        created_on: "2026-07-13T00:00:00.000Z",
        updated_on: "2026-07-13T00:00:00.000Z",
      },
      {
        id: 2,
        project: { id: 1, name: "Demo" },
        name: "v0.9",
        description: null,
        status: "locked",
        due_date: null,
        sharing: "descendants",
        wiki_page_title: null,
        created_on: "2026-07-12T00:00:00.000Z",
        updated_on: "2026-07-12T00:00:00.000Z",
      },
    ] as const;
    return HttpResponse.json({
      versions,
      total_count: versions.length,
    });
  }),
  http.get(`${context.endpoint}/versions/:id.json`, ({ params }) => {
    const version = {
      id: Number(params.id),
      project: { id: 1, name: "Demo" },
      name: "v1.0",
      description: "",
      status: "open",
      due_date: "2026-08-01",
      sharing: "none",
      wiki_page_title: "",
      created_on: "2026-07-13T00:00:00.000Z",
      updated_on: "2026-07-13T00:00:00.000Z",
    } as const;
    return HttpResponse.json({ version });
  }),
  http.post(`${context.endpoint}/projects/:id/versions.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/versions/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/versions/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/projects/422/versions.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/projects/404/versions.json`, () => {
    return notFound();
  }),
  http.get(`${context.endpoint}/versions/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/versions/404.json`, () => {
    return notFound();
  }),
  http.post(`${context.endpoint}/projects/422/versions.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/projects/404/versions.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/versions/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/versions/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/versions/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/versions/404.json`, () => {
    return notFound();
  }),
];
