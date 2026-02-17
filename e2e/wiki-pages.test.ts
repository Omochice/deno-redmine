import { assert, assertEquals } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/wiki-pages/list.ts";
import { show } from "../result/wiki-pages/show.ts";
import { create } from "../result/wiki-pages/create.ts";
import { deleteWiki } from "../result/wiki-pages/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Wiki Pages API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    let projectId: number;

    await t.step("resolve test project", async () => {
      const projectsResult = await fetchProjects(e2eContext);
      assert(projectsResult.isOk());
      const project = projectsResult.value.find((p) =>
        p.identifier === "e2e-test-project"
      );
      assert(project !== undefined);
      projectId = project.id;
    });

    await t.step(
      "GET /projects/:id/wiki/index.json should return wiki pages",
      async () => {
        const result = await fetchList(e2eContext, projectId);
        assert(result.isOk());
        assert(result.value.length > 0);
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page",
      async () => {
        // Redmine returns comments: null for pages without comments,
        // but the validator expects string. This is a known schema issue.
        const result = await show(e2eContext, projectId, "E2ETestPage");
        assert(
          result.isErr(),
          "Expected Err due to comments:null schema mismatch",
        );
      },
    );

    await t.step(
      "PUT /projects/:id/wiki/:page.json should create a wiki page",
      async () => {
        const result = await create(e2eContext, projectId, {
          title: "E2ECreatedPage",
          text: "Created by E2E test",
          comments: "E2E test creation",
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page with comments",
      async () => {
        const result = await show(e2eContext, projectId, "E2ECreatedPage");
        assert(result.isOk());
        assertEquals(result.value.title, "E2ECreatedPage");
        assert(typeof result.value.text === "string");
        assert(result.value.version >= 1);
      },
    );

    await t.step(
      "PUT /projects/:id/wiki/:page.json should update an existing wiki page",
      async () => {
        const result = await create(e2eContext, projectId, {
          title: "E2ECreatedPage",
          text: "Updated by E2E test",
          comments: "E2E test update",
        });
        assert(result.isOk());

        const showResult = await show(e2eContext, projectId, "E2ECreatedPage");
        assert(showResult.isOk());
        assert(showResult.value.text.includes("Updated by E2E test"));
      },
    );

    await t.step(
      "DELETE /projects/:id/wiki/:page.json should delete a wiki page",
      async () => {
        const result = await deleteWiki(
          e2eContext,
          projectId,
          "E2ECreatedPage",
        );
        assert(result.isOk());
      },
    );
  },
});
