import { http, HttpResponse } from "npm:msw@2.12.7";
import { STATUS_CODE } from "jsr:@std/http@1.0.23/status";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

export const validResponseHandelers = [
  http.get(
    `${context.endpoint}/projects/:id/wiki/index.json`,
    () => {
      return HttpResponse.json({
        wiki_pages: [
          {
            title: "CookBook_documentation",
            version: 3,
            created_on: "2023-01-01T00:00:00Z",
            updated_on: "2023-01-15T10:30:00Z",
          },
          {
            title: "Page_with_an_inline_image",
            version: 1,
            created_on: "2023-01-02T00:00:00Z",
            updated_on: "2023-01-02T00:00:00Z",
            parent: { title: "CookBook_documentation" },
          },
        ],
      });
    },
  ),
  http.get(`${context.endpoint}/projects/:id/wiki/:page.json`, ({ params }) => {
    const { id, page } = params;
    return HttpResponse.json({
      wiki_page: {
        title: page,
        version: 3,
        text: `# sample page on project ${id}`,
        author: {
          id: 1,
          name: "Admin User",
          login: "admin",
        },
        comments: "Updated via API",
        created_on: "2023-01-01T00:00:00Z",
        updated_on: "2023-01-02T00:00:00Z",
      },
    });
  }),
  http.get(
    `${context.endpoint}/projects/:id/wiki/:page/:version.json`,
    ({ params }) => {
      const { id, page, version } = params;
      return HttpResponse.json({
        wiki_page: {
          title: page,
          version: Number(version),
          text: `# sample page on project ${id}`,
          author: {
            id: 1,
            name: "Admin User",
            login: "admin",
          },
          comments: "Updated via API",
          created_on: "2023-01-01T00:00:00Z",
          updated_on: "2023-01-02T00:00:00Z",
        },
      });
    },
  ),
  http.put(
    `${context.endpoint}/projects/:id/wiki/create.json`,
    async ({ request }) => {
      const r = await request.json() as unknown as {
        wiki_page: {
          text: string;
          comments?: string;
          version?: number;
          parent_title?: string;
        };
      };
      // NOTE: If page is not found, it will create a new page and return 200.
      return HttpResponse.json(
        (r.wiki_page.comments ?? "").length > 1024
          ? {
            errors: ["Comment is too long"],
          }
          : {},
        { status: STATUS_CODE.OK },
      );
    },
  ),
  http.put(
    `${context.endpoint}/projects/:id/wiki/update.json`,
    async ({ request }) => {
      const r = await request.json() as unknown as {
        wiki_page: {
          text: string;
          comments?: string;
          version?: number;
          parent_title?: string;
        };
      };
      return HttpResponse.json(
        (r.wiki_page.comments ?? "").length > 1024
          ? {
            errors: ["Comment is too long"],
          }
          : {},
        { status: STATUS_CODE.OK },
      );
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      return HttpResponse.json({
        status: STATUS_CODE.NoContent,
      });
    },
  ),
];

export const invalidResponseHandlers = [
  http.get(
    `${context.endpoint}/projects/:id/wiki/index.json`,
    () => {
      return HttpResponse.json({
        errors: ["sample error"],
      }, {
        status: STATUS_CODE.UnprocessableEntity,
        statusText: "Unprocessable Entity",
      });
    },
  ),
  http.get(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      return HttpResponse.json({
        errors: ["sample error"],
      }, {
        status: STATUS_CODE.UnprocessableEntity,
        statusText: "Unprocessable Entity",
      });
    },
  ),
  http.put(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      return HttpResponse.json({
        errors: ["sample error"],
      }, {
        status: 422,
        statusText: "Unprocessable Entity",
      });
    },
  ),
  http.put(
    `${context.endpoint}/projects/:id/wiki/conflict.json`,
    () => {
      return HttpResponse.json({
        status: STATUS_CODE.Conflict,
      });
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/wiki/forbidden.json`,
    () => {
      return HttpResponse.json({}, {
        status: STATUS_CODE.Forbidden,
      });
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/wiki/notfound.json`,
    () => {
      return HttpResponse.json({}, {
        status: STATUS_CODE.NotFound,
      });
    },
  ),
];
