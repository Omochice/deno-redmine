import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/my/account.json`, () => {
    const user = {
      id: 1,
      login: "jsmith",
      admin: true,
      firstname: "John",
      lastname: "Smith",
      mail: "jsmith@example.com",
      created_on: "2026-01-01T00:00:00.000Z",
      last_login_on: "2026-07-13T00:00:00.000Z",
      api_key: "sample-api-key",
      mail_notification: "only_my_events",
      custom_fields: [
        { id: 1, name: "Phone", value: "090-0000-0000" },
      ],
    } as const;
    return HttpResponse.json({ user });
  }),
  http.put(`${context.endpoint}/my/account.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/my/account.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/my/account.json`, () => {
    return unprocessableEntity();
  }),
];

export const notFoundHandlers = [
  http.get(`${context.endpoint}/my/account.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/my/account.json`, () => {
    return notFound();
  }),
];
