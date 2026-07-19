import { http, HttpResponse } from "npm:msw@2.15.0";
import { notFound, unprocessableEntity } from "../_msw.ts";

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
    return unprocessableEntity();
  }),
  http.get(
    `${context.endpoint}/enumerations/time_entry_activities.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.get(
    `${context.endpoint}/enumerations/document_categories.json`,
    () => {
      return unprocessableEntity();
    },
  ),
];

export const notFoundHandlers = [
  http.get(`${context.endpoint}/enumerations/issue_priorities.json`, () => {
    return notFound();
  }),
  http.get(
    `${context.endpoint}/enumerations/time_entry_activities.json`,
    () => {
      return notFound();
    },
  ),
  http.get(
    `${context.endpoint}/enumerations/document_categories.json`,
    () => {
      return notFound();
    },
  ),
];
