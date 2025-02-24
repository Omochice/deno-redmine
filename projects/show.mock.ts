import { http, HttpResponse } from "npm:msw@2.7.3";

const sampleProject = {
  id: 1,
  name: "sample project name",
  identifier: "sample",
  description: "sample project",
  homepage: "",
  status: 1,
  is_public: true,
  inherit_members: false,
  enable_new_ticket_message: undefined,
  new_ticket_message: undefined,
  default_version: undefined,
  created_on: "1970-01-01T00:00:00.000Z",
  updated_on: "1971-01-01T00:00:00.000Z",
  parent: undefined,
} as const;

export const handler = [
  http.get("http://redmine.example.com/projects/1.json", () => {
    return HttpResponse.json({
      project: sampleProject,
    }, {
      status: 200,
    });
  }),
  http.get("http://redmine.example.com/projects/2.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get("http://redmine.example.com/projects/3.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};
