import { http, HttpResponse } from "npm:msw@2.7.3";

export const handler = [
  {
    n: 1,
    r: {
      status: 200,
      obj: {},
    },
  },
  {
    n: 2,
    r: {
      status: 422,
      obj: { errors: ["some error"] },
    },
  },
  {
    n: 3,
    r: {
      status: 404,
      obj: "not found",
    },
  },
].map(({ n, r }) => {
  return http.put(`http://redmine.example.com/issues/${n}.json`, () => {
    return HttpResponse.json(r.obj, { status: r.status });
  });
});

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};
