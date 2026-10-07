import { http, HttpResponse } from "npm:msw@2.15.0";
import { notFound, unprocessableEntity } from "../_msw.ts";

/** Client context pointing at the mocked Redmine endpoint. */
export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/** Handlers that answer the search endpoint successfully. */
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

/** Handler that answers the search endpoint with a not-found response for query 404 and a validation error otherwise. */
export const invalidHandlers = [
  http.get(`${context.endpoint}/search.json`, ({ request }) => {
    const q = new URL(request.url).searchParams.get("q");
    if (q === "404") {
      return notFound();
    }
    return unprocessableEntity();
  }),
];
