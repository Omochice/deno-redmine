import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/groups.json`, () => {
    return HttpResponse.json({
      groups: [
        { id: 53, name: "Managers" },
        { id: 55, name: "Developers" },
      ],
    });
  }),
  http.get(`${context.endpoint}/groups/:id.json`, ({ params }) => {
    const group = {
      id: Number(params.id),
      name: "Developers",
      users: [
        { id: 5, name: "John Smith" },
        { id: 8, name: "Dave Loper" },
      ],
      memberships: [
        {
          id: 12,
          project: { id: 1, name: "Demo" },
          roles: [{ id: 3, name: "Manager" }],
        },
      ],
    } as const;
    return HttpResponse.json({ group });
  }),
  http.post(`${context.endpoint}/groups.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/groups/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/groups/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.post(`${context.endpoint}/groups/:id/users.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(
    `${context.endpoint}/groups/:id/users/:user_id.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NoContent });
    },
  ),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/groups.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/groups.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/groups/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/groups/404.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/groups/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/groups/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/groups/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/groups/404.json`, () => {
    return notFound();
  }),
  http.post(`${context.endpoint}/groups/422/users.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/groups/404/users.json`, () => {
    return notFound();
  }),
  http.delete(
    `${context.endpoint}/groups/422/users/:user_id.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.delete(
    `${context.endpoint}/groups/404/users/:user_id.json`,
    () => {
      return notFound();
    },
  ),
];
