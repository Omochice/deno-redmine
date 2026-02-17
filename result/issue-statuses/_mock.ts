import { http, HttpResponse } from "npm:msw@2.12.10";
import { STATUS_CODE } from "jsr:@std/http@1.0.24/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

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

export const invalidHandlers = [
  http.get(`${context.endpoint}/issue_statuses.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
];
