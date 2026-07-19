import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/projects/:id/issue_categories.json`, () => {
    const issueCategories = [
      {
        id: 3,
        project: { id: 1, name: "Demo" },
        name: "Bug",
        assigned_to: { id: 5, name: "Alice" },
      },
      {
        id: 2,
        project: { id: 1, name: "Demo" },
        name: "Feature",
        assigned_to: null,
      },
    ] as const;
    return HttpResponse.json({
      issue_categories: issueCategories,
      total_count: issueCategories.length,
    });
  }),
  http.get(`${context.endpoint}/issue_categories/:id.json`, ({ params }) => {
    const issueCategory = {
      id: Number(params.id),
      project: { id: 1, name: "Demo" },
      name: "Bug",
      assigned_to: { id: 5, name: "Alice" },
    } as const;
    return HttpResponse.json({ issue_category: issueCategory });
  }),
  http.post(
    `${context.endpoint}/projects/:id/issue_categories.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.Created });
    },
  ),
  http.put(`${context.endpoint}/issue_categories/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/issue_categories/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(
    `${context.endpoint}/projects/422/issue_categories.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.get(
    `${context.endpoint}/projects/404/issue_categories.json`,
    () => {
      return notFound();
    },
  ),
  http.get(`${context.endpoint}/issue_categories/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/issue_categories/404.json`, () => {
    return notFound();
  }),
  http.post(
    `${context.endpoint}/projects/422/issue_categories.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.post(
    `${context.endpoint}/projects/404/issue_categories.json`,
    () => {
      return notFound();
    },
  ),
  http.put(`${context.endpoint}/issue_categories/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/issue_categories/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/issue_categories/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/issue_categories/404.json`, () => {
    return notFound();
  }),
];
