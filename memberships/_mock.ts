import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/projects/:id/memberships.json`, () => {
    const memberships = [
      {
        id: 5,
        project: { id: 1, name: "Demo" },
        user: { id: 17, name: "David Robert" },
        roles: [
          { id: 1, name: "Manager", inherited: true },
          { id: 2, name: "Developer" },
        ],
      },
      {
        id: 6,
        project: { id: 1, name: "Demo" },
        group: { id: 8, name: "Developers" },
        roles: [
          { id: 2, name: "Developer" },
        ],
      },
    ] as const;
    return HttpResponse.json({
      memberships,
      total_count: memberships.length,
    });
  }),
  http.get(`${context.endpoint}/memberships/:id.json`, ({ params }) => {
    const membership = {
      id: Number(params.id),
      project: { id: 1, name: "Demo" },
      user: { id: 17, name: "David Robert" },
      roles: [
        { id: 1, name: "Manager", inherited: true },
        { id: 2, name: "Developer" },
      ],
    } as const;
    return HttpResponse.json({ membership });
  }),
  http.post(`${context.endpoint}/projects/:id/memberships.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/memberships/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/memberships/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/projects/422/memberships.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/projects/404/memberships.json`, () => {
    return notFound();
  }),
  http.get(`${context.endpoint}/memberships/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/memberships/404.json`, () => {
    return notFound();
  }),
  http.post(`${context.endpoint}/projects/422/memberships.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/projects/404/memberships.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/memberships/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/memberships/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/memberships/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/memberships/404.json`, () => {
    return notFound();
  }),
];
