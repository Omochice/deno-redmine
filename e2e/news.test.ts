import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/news/list.ts";
import { fetchListByProject } from "../result/news/list-by-project.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: News API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    await t.step("GET /news.json should return an array of news", async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(Array.isArray(result.value));
    });

    await t.step(
      "GET /projects/:project_id/news.json should return an array of news",
      async () => {
        // The seeded e2e project may have zero news items, so only the
        // response shape is asserted rather than its length.
        const result = await fetchListByProject(e2eContext, project.id);
        assert(result.isOk());
        assert(Array.isArray(result.value));
      },
    );
  },
});
