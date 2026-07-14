import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
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

    await t.step("GET /news.json should return the seeded news", async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      const seeded = result.value.find((n) => n.title === "E2E News");
      assert(seeded !== undefined);
      assertEquals(seeded.summary, "E2E news summary");
      assertEquals(seeded.description, "E2E news description");
      assert(seeded.project !== undefined);
      assert(seeded.author !== undefined);
      assert(seeded.createdOn instanceof Date);
    });

    await t.step(
      "GET /projects/:project_id/news.json should return the project news",
      async () => {
        const result = await fetchListByProject(e2eContext, project.id);
        assert(result.isOk());
        const seeded = result.value.find((n) => n.title === "E2E News");
        assert(seeded !== undefined);
        // A news created without a summary is rendered as an empty string
        // (not null), which is why the schema keeps `summary` a required string.
        const noSummary = result.value.find((n) =>
          n.title === "E2E News Without Summary"
        );
        assert(noSummary !== undefined);
        assertEquals(noSummary.summary, "");
      },
    );
  },
});
