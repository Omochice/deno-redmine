import { http, HttpResponse } from "npm:msw@2.8.1";

const sampleProjects = [
  {
    id: 3,
    name: "sample3",
    identifier: "sample3",
    description: "sample project 3",
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-03-01t00:00:00.000z",
    updated_on: "1971-03-01t00:00:00.000z",
    parent: undefined,
  },
  {
    id: 2,
    name: "sample2",
    identifier: "sample2",
    description: null,
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-02-01t00:00:00.000z",
    updated_on: "1971-02-01t00:00:00.000z",
    parent: undefined,
  },
  {
    id: 1,
    name: "sample project name",
    identifier: "sample",
    description: "sample project",
    homepage: undefined,
    status: 1,
    is_public: true,
    inherit_members: false,
    enable_new_ticket_message: undefined,
    new_ticket_message: undefined,
    default_version: undefined,
    created_on: "1970-01-01t00:00:00.000z",
    updated_on: "1971-01-01t00:00:00.000z",
    parent: undefined,
  },
] as const;

export const handler = [
  http.get("http://redmine1.example.com/projects.json", () => {
    return HttpResponse.json({
      projects: sampleProjects,
      total_count: 3,
      offset: 0,
      limit: 25,
    }, {
      status: 200,
    });
  }),
  http.get("http://redmine2.example.com/projects.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get("http://redmine3.example.com/projects.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const contexts = [
  { apiKey: "sample", endpoint: "http://redmine1.example.com" },
  { apiKey: "sample", endpoint: "http://redmine2.example.com" },
  { apiKey: "sample", endpoint: "http://redmine3.example.com" },
];
