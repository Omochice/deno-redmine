import { http, HttpResponse } from "npm:msw@2.15.0";
import { unprocessableEntity } from "../_msw.ts";

/** Client context pointing at the mocked Redmine endpoint. */
export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/** Handlers that answer the issue statuses listing successfully. */
export const validHandlers = [
  http.get(`${context.endpoint}/issue_statuses.json`, () => {
    return HttpResponse.json({
      issue_statuses: [
        { id: 1, name: "New", is_closed: false },
        { id: 2, name: "In Progress", is_closed: false },
        { id: 5, name: "Closed", is_closed: true },
      ],
    });
  }),
];

/** Handlers that answer the issue statuses listing with a Redmine validation error. */
export const invalidHandlers = [
  http.get(`${context.endpoint}/issue_statuses.json`, () => {
    return unprocessableEntity();
  }),
];
