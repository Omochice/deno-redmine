import { http, HttpResponse } from "npm:msw@2.8.7";

export const handler = [
  http.put("http://redmine.example.com/projects/1/archive.json", () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  http.put("http://redmine.example.com/projects/2/archive.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.put("http://redmine.example.com/projects/3/archive.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
  http.put("http://redmine.example.com/projects/1/unarchive.json", () => {
    return HttpResponse.json({}, { status: 200 });
  }),
  http.put("http://redmine.example.com/projects/2/unarchive.json", () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: 422,
      statusText: "Unprocessable Entity",
    });
  }),
  http.put("http://redmine.example.com/projects/3/unarchive.json", () => {
    return new HttpResponse(null, { status: 404 });
  }),
];

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};
