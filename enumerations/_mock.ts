import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/enumerations/issue_priorities.json`, () => {
    return HttpResponse.json({
      issue_priorities: [
        { id: 3, name: "Low", is_default: false, active: true },
        { id: 4, name: "Normal", is_default: true, active: true },
        { id: 5, name: "High", is_default: false, active: true },
      ],
    });
  }),
  http.get(
    `${context.endpoint}/enumerations/time_entry_activities.json`,
    () => {
      return HttpResponse.json({
        time_entry_activities: [
          { id: 8, name: "Design", is_default: false, active: true },
          { id: 9, name: "Development", is_default: true, active: true },
        ],
      });
    },
  ),
  http.get(
    `${context.endpoint}/enumerations/document_categories.json`,
    () => {
      return HttpResponse.json({
        document_categories: [
          {
            id: 1,
            name: "User documentation",
            is_default: false,
            active: true,
          },
          {
            id: 2,
            name: "Technical documentation",
            is_default: false,
            active: true,
          },
        ],
      });
    },
  ),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/enumerations/issue_priorities.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(
    `${context.endpoint}/enumerations/time_entry_activities.json`,
    () => {
      return HttpResponse.json({
        errors: ["sample error"],
      }, {
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
        status: STATUS_CODE.UnprocessableEntity,
        statusText: "Unprocessable Entity",
      });
    },
  ),
  http.get(
    `${context.endpoint}/enumerations/document_categories.json`,
    () => {
      return HttpResponse.json({
        errors: ["sample error"],
      }, {
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
        status: STATUS_CODE.UnprocessableEntity,
        statusText: "Unprocessable Entity",
      });
    },
  ),
];

export const notFoundHandlers = [
  http.get(`${context.endpoint}/enumerations/issue_priorities.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.get(
    `${context.endpoint}/enumerations/time_entry_activities.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NotFound });
    },
  ),
  http.get(
    `${context.endpoint}/enumerations/document_categories.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NotFound });
    },
  ),
];
