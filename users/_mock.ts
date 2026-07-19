import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/users.json`, () => {
    const users = [
      {
        id: 2,
        login: "jsmith",
        firstname: "John",
        lastname: "Smith",
        mail: "jsmith@example.com",
        created_on: "2026-07-12T00:00:00.000Z",
        updated_on: "2026-07-12T00:00:00.000Z",
        last_login_on: "2026-07-13T00:00:00.000Z",
      },
      {
        id: 1,
        login: "admin",
        firstname: "Redmine",
        lastname: "Admin",
        mail: "admin@example.com",
        created_on: "2026-07-11T00:00:00.000Z",
        updated_on: "2026-07-11T00:00:00.000Z",
        last_login_on: null,
        admin: true,
        api_key: "abcdef1234567890",
        status: 1,
      },
    ] as const;
    return HttpResponse.json({
      users,
      total_count: users.length,
      offset: 0,
      limit: 25,
    });
  }),
  http.get(`${context.endpoint}/users/:id.json`, ({ params }) => {
    const user = {
      id: Number(params.id),
      login: "jsmith",
      firstname: "John",
      lastname: "Smith",
      mail: "jsmith@example.com",
      created_on: "2026-07-12T00:00:00.000Z",
      updated_on: "2026-07-12T00:00:00.000Z",
      last_login_on: "2026-07-13T00:00:00.000Z",
    } as const;
    return HttpResponse.json({ user });
  }),
  http.post(`${context.endpoint}/users.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/users/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/users/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/422/users.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/404/users.json`, () => {
    return notFound();
  }),
  http.get(`${context.endpoint}/users/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/users/404.json`, () => {
    return notFound();
  }),
  http.post(`${context.endpoint}/422/users.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/404/users.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/users/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/users/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/users/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/users/404.json`, () => {
    return notFound();
  }),
];
