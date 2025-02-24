import { http, HttpResponse } from "npm:msw@2.7.3";

export const validHandler = [
  http.get("http://redmine.example.com/issues.json", () => {
    const issues = [
      {
        id: 3,
        project: { id: 1, name: "hi" },
        tracker: { id: 1, name: "issue" },
        status: { id: 4, name: "closed", is_closed: true },
        priority: { id: 1, name: "normal" },
        author: { id: 1, name: "sample user" },
        assigned_to: { id: 1, name: "sample user" },
        category: undefined,
        subject: "closed",
        description: "",
        start_date: "2023-10-10T00:00:00Z",
        due_date: null,
        done_ratio: 0,
        is_private: false,
        estimated_hours: null,
        total_estimated_hours: 0,
        spent_hours: 0,
        total_spent_hours: 0,
        created_on: "2023-10-10T13:19:24Z",
        updated_on: "2023-10-10T13:20:47Z",
        closed_on: "2023-10-10T13:20:47Z",
        custom_fields: undefined,
      },
      {
        id: 2,
        project: { id: 1, name: "hi" },
        tracker: { id: 1, name: "issue" },
        status: { id: 1, name: "open", is_closed: false },
        priority: { id: 1, name: "noreal" },
        author: { id: 1, name: "sample user" },
        assigned_to: undefined,
        category: undefined,
        subject: "not asigned",
        description: "",
        start_date: "2023-10-09T00:00:00Z",
        due_date: null,
        done_ratio: 0,
        is_private: false,
        estimated_hours: null,
        total_estimated_hours: 0,
        spent_hours: 0,
        total_spent_hours: 0,
        created_on: "2023-10-09T14:52:19Z",
        updated_on: "2023-10-09T14:52:19Z",
        closed_on: null,
        custom_fields: undefined,
      },
      {
        id: 1,
        project: { id: 1, name: "hi" },
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
      },
    ];
    return HttpResponse.json({
      issues,
      total_count: issues.length,
      offset: 0,
      limit: 25,
    });
  }),
];

export const invalidHandler = [
  http.get("http://redmine.example.com/issues.json", () => {
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
