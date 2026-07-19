import { http, HttpResponse } from "npm:msw@2.15.0";
import { STATUS_CODE } from "jsr:@std/http@1.1.2/status";
import { notFound, unprocessableEntity } from "../_msw.ts";

export const context = {
  apiKey: "sample",
  endpoint: "http://redmine.example.com",
};

/**
 * Build a `wiki_page` response payload, letting each caller override only the
 * fields it cares about. Keeps the response shape defined in one place.
 */
export function wikiPage(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    title: "sample-title",
    version: 3,
    text: "# sample page",
    author: { id: 1, name: "Admin User", login: "admin" },
    comments: "Updated via API",
    created_on: "2023-01-01T00:00:00Z",
    updated_on: "2023-01-02T00:00:00Z",
    ...overrides,
  };
}

export const validResponseHandlers = [
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
      wiki_page: wikiPage({
        title: page,
        text: `# sample page on project ${id}`,
      }),
    });
  }),
  http.get(
    `${context.endpoint}/projects/:id/wiki/:page/:version.json`,
    ({ params }) => {
      const { id, page, version } = params;
      return HttpResponse.json({
        wiki_page: wikiPage({
          title: page,
          version: Number(version),
          text: `# sample page on project ${id}`,
        }),
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
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
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
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
        { status: STATUS_CODE.OK },
      );
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
      return new HttpResponse(null, { status: STATUS_CODE.NoContent });
    },
  ),
];

export const invalidResponseHandlers = [
  http.get(
    `${context.endpoint}/projects/:id/wiki/index.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.get(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      return unprocessableEntity();
    },
  ),
  http.put(
    `${context.endpoint}/projects/:id/wiki/:page.json`,
    () => {
      return unprocessableEntity();
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
        // @ts-expect-error: msw HttpResponseInit conflicts with Deno built-in type
        status: STATUS_CODE.Forbidden,
      });
    },
  ),
  http.delete(
    `${context.endpoint}/projects/:id/wiki/notfound.json`,
    () => {
      return notFound();
    },
  ),
];
