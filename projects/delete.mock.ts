import { http, HttpResponse } from "npm:msw@2.7.4";

export const handler = [
  http.delete("http://redmine.example.com/projects/1.json", () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  http.delete("http://redmine.example.com/projects/2.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.delete("http://redmine.example.com/projects/3.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};
