import { http, HttpResponse } from "npm:msw@3.0.2";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.put(`${context.endpoint}/journals/:id.json`, () => {
    return HttpResponse.json({});
  }),
];

export const invalidHandlers = [
  http.put(`${context.endpoint}/journals/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/journals/404.json`, () => {
    return notFound();
  }),
];
