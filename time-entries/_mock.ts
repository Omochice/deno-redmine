import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.get(`${context.endpoint}/time_entries.json`, () => {
    const timeEntries = [
      {
        id: 3,
        project: { id: 1, name: "Demo" },
        issue: { id: 5 },
        user: { id: 1, name: "Redmine Admin" },
        activity: { id: 9, name: "Development" },
        hours: 2.5,
        comments: "Implemented feature",
        spent_on: "2026-07-01",
        created_on: "2026-07-13T00:00:00.000Z",
        updated_on: "2026-07-13T00:00:00.000Z",
      },
      {
        id: 2,
        project: { id: 1, name: "Demo" },
        issue: undefined,
        user: { id: 1, name: "Redmine Admin" },
        activity: { id: 8, name: "Design" },
        hours: 1,
        comments: null,
        spent_on: "2026-06-30",
        created_on: "2026-06-30T00:00:00.000Z",
        updated_on: "2026-06-30T00:00:00.000Z",
      },
    ] as const;
    return HttpResponse.json({
      time_entries: timeEntries,
      total_count: timeEntries.length,
      offset: 0,
      limit: 25,
    });
  }),
  http.get(`${context.endpoint}/time_entries/:id.json`, ({ params }) => {
    const timeEntry = {
      id: Number(params.id),
      project: { id: 1, name: "Demo" },
      issue: { id: 5 },
      user: { id: 1, name: "Redmine Admin" },
      activity: { id: 9, name: "Development" },
      hours: 2.5,
      comments: "Implemented feature",
      spent_on: "2026-07-01",
      created_on: "2026-07-13T00:00:00.000Z",
      updated_on: "2026-07-13T00:00:00.000Z",
    } as const;
    return HttpResponse.json({ time_entry: timeEntry });
  }),
  http.post(`${context.endpoint}/time_entries.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.Created });
  }),
  http.put(`${context.endpoint}/time_entries/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
  http.delete(`${context.endpoint}/time_entries/:id.json`, () => {
    // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
    return new HttpResponse(null, { status: STATUS_CODE.NoContent });
  }),
];

export const invalidHandlers = [
  http.get(`${context.endpoint}/422/time_entries.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/404/time_entries.json`, () => {
    return notFound();
  }),
  http.get(`${context.endpoint}/time_entries/422.json`, () => {
    return unprocessableEntity();
  }),
  http.get(`${context.endpoint}/time_entries/404.json`, () => {
    return notFound();
  }),
  http.post(`${context.endpoint}/422/time_entries.json`, () => {
    return unprocessableEntity();
  }),
  http.post(`${context.endpoint}/404/time_entries.json`, () => {
    return notFound();
  }),
  http.put(`${context.endpoint}/time_entries/422.json`, () => {
    return unprocessableEntity();
  }),
  http.put(`${context.endpoint}/time_entries/404.json`, () => {
    return notFound();
  }),
  http.delete(`${context.endpoint}/time_entries/422.json`, () => {
    return unprocessableEntity();
  }),
  http.delete(`${context.endpoint}/time_entries/404.json`, () => {
    return notFound();
  }),
];
