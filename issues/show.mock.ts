import { http, HttpResponse } from "npm:msw@2.7.4";

export const validHandler = [
  http.get("http://redmine.example.com/issues/1.json", () => {
    const issue = {
      id: 1,
      project: { id: 1, name: "sample project" },
      tracker: { id: 1, name: "issue" },
      status: { id: 1, name: "open", is_closed: false },
      priority: { id: 1, name: "normal" },
      author: { id: 1, name: "sample user" },
      assigned_to: { id: 1, name: "Redmine Admin" },
      category: undefined,
      subject: "sample1",
      description: "",
      start_date: "2023-10-09T00:00:00Z",
      due_date: null,
      done_ratio: 0,
      is_private: false,
      estimated_hours: null,
      total_estimated_hours: 0,
      spent_hours: 0,
      total_spent_hours: 0,
      created_on: "2023-10-09T12:17:17Z",
      updated_on: "2023-10-09T12:17:17Z",
      closed_on: null,
      custom_fields: undefined,
    };
    return HttpResponse.json(
      { issue },
      { status: 200 },
    );
  }),
];

export const invalidHandler = [
  http.get("http://redmine.example.com/issues/1.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
];

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};
