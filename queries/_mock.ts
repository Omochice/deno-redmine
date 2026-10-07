import { http, HttpResponse } from "npm:msw@2.15.0";
import { unprocessableEntity } from "../_msw.ts";

/** Client context pointing at the mocked Redmine endpoint. */
export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/** Handlers that answer the queries listing successfully. */
export const validHandlers = [
  http.get(`${context.endpoint}/queries.json`, () => {
    return HttpResponse.json({
      queries: [
        { id: 1, name: "All issues", is_public: true, project_id: 1 },
        { id: 2, name: "Open issues", is_public: true, project_id: null },
        { id: 3, name: "My private query", is_public: false, project_id: 1 },
      ],
    });
  }),
];

/** Handlers that answer the queries listing with a Redmine validation error. */
export const invalidHandlers = [
  http.get(`${context.endpoint}/queries.json`, () => {
    return unprocessableEntity();
  }),
];
