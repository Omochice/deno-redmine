import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/roles.json`, () => {
    return HttpResponse.json({
      roles: [
        { id: 1, name: "Manager" },
        { id: 2, name: "Developer" },
      ],
    });
  }),
  http.get(`${context.endpoint}/roles/:id.json`, ({ params }) => {
    return HttpResponse.json({
      role: {
        id: Number(params.id),
        name: "Manager",
        assignable: true,
        issues_visibility: "default",
        time_entries_visibility: "all",
        users_visibility: "all",
        permissions: ["view_issues", "add_issues", "add_issue_notes"],
      },
    });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/roles.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/roles/422.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/roles/404.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
];
