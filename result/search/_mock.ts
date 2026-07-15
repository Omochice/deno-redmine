import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/search.json`, () => {
    const results = [
      {
        id: 1,
        title: "Issue #1: E2E sample",
        type: "issue",
        url: "http://redmine.example.com/issues/1",
        description: "E2E sample issue description",
        datetime: "2026-07-13T00:00:00.000Z",
      },
      {
        id: 2,
        title: "Wiki: E2E sample",
        type: "wiki-page",
        url: "http://redmine.example.com/projects/1/wiki/E2E",
        description: "E2E sample wiki description",
        datetime: "2026-07-12T00:00:00.000Z",
      },
      {
        id: 3,
        title: "Project: E2E sample",
        type: "project",
        url: "http://redmine.example.com/projects/1",
        // Redmine returns null when the matched object has no description.
        description: null,
        datetime: "2026-07-11T00:00:00.000Z",
      },
    ] as const;
    return HttpResponse.json({
      results,
      total_count: results.length,
      offset: 0,
      limit: 25,
    });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/search.json`, ({ request }) => {
    const q = new URL(request.url).searchParams.get("q");
    if (q === "404") {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NotFound });
    }
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
];
