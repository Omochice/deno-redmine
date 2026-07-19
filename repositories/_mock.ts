import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.post(
    `${context.endpoint}/projects/:id/repository/:repositoryId/revisions/:rev/issues.json`,
    () => {
      return HttpResponse.json({});
    },
  ),
  http.post(
    `${context.endpoint}/projects/:id/repository/revisions/:rev/issues.json`,
    () => {
      return HttpResponse.json({});
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/repository/:repositoryId/revisions/:rev/issues/:issueId.json`,
    () => {
      return HttpResponse.json({});
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/repository/revisions/:rev/issues/:issueId.json`,
    () => {
      return HttpResponse.json({});
    },
  ),
];

export const invalidHandlers = [
  http.post(
    `${context.endpoint}/projects/422/repository/revisions/:rev/issues.json`,
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
  http.post(
    `${context.endpoint}/projects/404/repository/revisions/:rev/issues.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NotFound });
    },
  ),
  http.delete(
    `${context.endpoint}/projects/422/repository/revisions/:rev/issues/:issueId.json`,
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
  http.delete(
    `${context.endpoint}/projects/404/repository/revisions/:rev/issues/:issueId.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NotFound });
    },
  ),
];
