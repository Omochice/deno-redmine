import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/news/list.ts";
import { fetchListByProject } from "../result/news/list-by-project.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: News API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project !== undefined).toBe(true);

    await t.step("GET /news.json should return the seeded news", async () => {
      const result = await fetchList(e2eContext);
      expect(result.isOk()).toBe(true);
      const seeded = result._unsafeUnwrap().find((n) => n.title === "E2E News");
      expect(seeded !== undefined).toBe(true);
      expect(seeded!.summary).toEqual("E2E news summary");
      expect(seeded!.description).toEqual("E2E news description");
      expect(seeded!.project !== undefined).toBe(true);
      expect(seeded!.author !== undefined).toBe(true);
      expect(seeded!.createdOn instanceof Date).toBe(true);
    });

    await t.step(
      "GET /projects/:project_id/news.json should return the project news",
      async () => {
        const result = await fetchListByProject(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        const seeded = result._unsafeUnwrap().find((n) =>
          n.title === "E2E News"
        );
        expect(seeded !== undefined).toBe(true);
        // A news created without a summary is rendered as an empty string
        // (not null), which is why the schema keeps `summary` a required string.
        const noSummary = result._unsafeUnwrap().find((n) =>
          n.title === "E2E News Without Summary"
        );
        expect(noSummary !== undefined).toBe(true);
        expect(noSummary!.summary).toEqual("");
      },
    );
  },
});
