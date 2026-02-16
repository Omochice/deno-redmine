import { http, HttpResponse } from "npm:msw@2.12.10";
import { STATUS_CODE } from "jsr:@std/http@1.0.24/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

const sampleVersion = {
  id: 1,
  project: { id: 1, name: "sample project" },
  name: "v1.0",
  description: "first release",
  status: "open",
  sharing: "none",
  due_date: "2024-12-31",
  wiki_page_title: null,
  estimated_hours: null,
  spent_hours: null,
  created_on: "2024-01-01T00:00:00Z",
  updated_on: "2024-01-02T00:00:00Z",
} as const;

export const validHandlers = [
  http.get(
    `${context.endpoint}/projects/:projectId/versions.json`,
    () => {
      return HttpResponse.json({
        versions: [sampleVersion],
        total_count: 1,
      });
    },
  ),
  http.get(`${context.endpoint}/versions/:id.json`, () => {
    return HttpResponse.json({ version: sampleVersion });
  }),
  http.post(
    `${context.endpoint}/projects/:projectId/versions.json`,
    () => {
      return HttpResponse.json(
        { version: sampleVersion },
        { status: STATUS_CODE.Created },
      );
    },
  ),
  http.put(`${context.endpoint}/versions/:id.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/versions/:id.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(
    `${context.endpoint}/projects/422/versions.json`,
    () => {
      return HttpResponse.json(
        { errors: ["sample error"] },
        { status: STATUS_CODE.UnprocessableEntity },
      );
    },
  ),
  http.get(`${context.endpoint}/versions/422.json`, () => {
    return HttpResponse.json(
      { errors: ["sample error"] },
      { status: STATUS_CODE.UnprocessableEntity },
    );
  }),
  http.get(`${context.endpoint}/versions/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.post(
    `${context.endpoint}/projects/422/versions.json`,
    () => {
      return HttpResponse.json(
        { errors: ["sample error"] },
        { status: STATUS_CODE.UnprocessableEntity },
      );
    },
  ),
  http.put(`${context.endpoint}/versions/422.json`, () => {
    return HttpResponse.json(
      { errors: ["sample error"] },
      { status: STATUS_CODE.UnprocessableEntity },
    );
  }),
  http.put(`${context.endpoint}/versions/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.delete(`${context.endpoint}/versions/422.json`, () => {
    return HttpResponse.json(
      { errors: ["sample error"] },
      { status: STATUS_CODE.UnprocessableEntity },
    );
  }),
  http.delete(`${context.endpoint}/versions/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
];
