import { http, HttpResponse } from "npm:msw@2.7.6";

export const handler = [
  http.post("http://redmine1.example.com/projects.json", () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  http.post("http://redmine2.example.com/projects.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.post("http://redmine3.example.com/projects.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const contexts = [
  { apiKey: "sample", endpoint: "http://redmine1.example.com" },
  { apiKey: "sample", endpoint: "http://redmine2.example.com" },
  { apiKey: "sample", endpoint: "http://redmine3.example.com" },
];
