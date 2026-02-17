import { show } from "./show.ts";
import { assert, assertEquals } from "jsr:@std/assert@1.0.18";
import {
  context,
  invalidResponseHandlers,
  validResponseHandelers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.12.10";
import { setupServer } from "npm:msw@2.12.10/node";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:id/wiki/:page.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title");
    assert(e.isOk());
    assert(e.value.title === "sample-title");
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
    assert(e.isOk());
    assertEquals(e.value.title, "sample-title");
    assertEquals(e.value.comments, undefined);
  });
  await t.step("If got 422, should be error", async () => {
    server.resetHandlers(...invalidResponseHandlers);
    const e = await show(context, 2, "sample-title");
    assert(e.isErr());
    assert(e.error.message === "Unprocessable Entity");
  });
});

Deno.test("GET /projects/:id/wiki/:page/:version.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validResponseHandelers);
    const e = await show(context, 1, "sample-title", 3);
    assert(e.isOk());
    assert(e.value.title === "sample-title");
    assert(e.value.version === 3);
  });
});
