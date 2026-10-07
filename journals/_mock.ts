import { http, HttpResponse } from "npm:msw@2.15.0";
import { notFound, unprocessableEntity } from "../_msw.ts";

/** Client context pointing at the mocked Redmine endpoint. */
export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/** Handlers that answer the journal update endpoint successfully. */
export const validHandlers = [
  http.put(`${context.endpoint}/journals/:id.json`, () => {
    return HttpResponse.json({});
  }),
];

/** Handlers that answer ids 422 and 404 on the journal endpoints with Redmine error responses. */
export const invalidHandlers = [
  http.put(`${context.endpoint}/journals/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/journals/404.json`, () => {
    return notFound();
  }),
];
