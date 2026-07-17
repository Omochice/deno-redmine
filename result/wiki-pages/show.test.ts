import { show } from "./show.ts";
import { expect } from "jsr:@std/expect@1.0.20";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title");
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().title).toBe("sample-title");
  });
  await t.step("if got 200 with null comments, should be success", async () => {
    server.resetHandlers(
      http.get(
        `${context.endpoint}/projects/:id/wiki/:page.json`,
        ({ params }) => {
          return HttpResponse.json({
            wiki_page: {
              title: params.page,
              version: 1,
              text: "# page content",
              author: { id: 1, name: "Admin" },
              comments: null,
              created_on: "2023-01-01T00:00:00Z",
              updated_on: "2023-01-01T00:00:00Z",
            },
          });
        },
      ),
    );
    const e = await show(context, 1, "sample-title");
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().title).toStrictEqual("sample-title");
    expect(e._unsafeUnwrap().comments).toBeUndefined();
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const e = await show(context, 2, "sample-title");
    expect(e.isErr()).toBe(true);
    expect(e._unsafeUnwrapErr().message).toBe("Unprocessable Entity");
  });
});

Deno.test("GET /projects/:id/wiki/:page/:version.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title", 3);
    expect(e.isOk()).toBe(true);
    expect(e._unsafeUnwrap().title).toBe("sample-title");
    expect(e._unsafeUnwrap().version).toBe(3);
  });
});
