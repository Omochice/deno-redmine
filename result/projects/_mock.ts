import { http, HttpResponse } from "npm:msw@2.12.4";
import { STATUS_CODE } from "jsr:@std/http@1.0.23/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validHandlers = [
  http.put(`${context.endpoint}/projects/:id/archive.json`, () => {
    return HttpResponse.json({});
  }),
  http.put(`${context.endpoint}/projects/:id/unarchive.json`, () => {
    return HttpResponse.json({});
  }),
  http.post(`${context.endpoint}/projects.json`, () => {
    return HttpResponse.json({});
  }),
  http.delete(`${context.endpoint}/projects/:id.json`, () => {
    return HttpResponse.json({});
  }),
  http.get(`${context.endpoint}/projects.json`, () => {
    const projects = [
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
    return HttpResponse.json({
      projects,
      total_count: projects.length,
      offset: 0,
      limit: 25,
    }, {
      status: 200,
    });
  }),
  http.get(`${context.endpoint}/projects/:id.json`, () => {
    const project = {
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
    return HttpResponse.json({ project });
  }),
  http.put(`${context.endpoint}/projects/:id.json`, () => {
    return HttpResponse.json({});
  }),
];

export const invalidHandlers = [
  http.put(`${context.endpoint}/projects/422/archive.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.put(`${context.endpoint}/projects/404/archive.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.put(`${context.endpoint}/projects/422/unarchive.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.put(`${context.endpoint}/projects/404/unarchive.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.post(`${context.endpoint}/422/projects.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.post(`${context.endpoint}/404/projects.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.delete(`${context.endpoint}/projects/422.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.delete(`${context.endpoint}/projects/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.get(`${context.endpoint}/422/projects.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/404/projects.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
  http.put(`${context.endpoint}/projects/422.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/projects/422.json`, () => {
    return HttpResponse.json({
      errors: ["sample error"],
    }, {
      status: STATUS_CODE.UnprocessableEntity,
      statusText: "Unprocessable Entity",
    });
  }),
  http.get(`${context.endpoint}/projects/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),

  http.put(`${context.endpoint}/projects/404.json`, () => {
    return new HttpResponse(null, { status: STATUS_CODE.NotFound });
  }),
];
