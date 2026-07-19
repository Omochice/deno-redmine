import { http, HttpResponse } from "npm:msw@2.15.0";
import { unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

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

export const invalidHandlers = [
  http.get(`${context.endpoint}/queries.json`, () => {
    return unprocessableEntity();
  }),
];
