import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/news/list.ts";
import { fetchListByProject } from "../result/news/list-by-project.ts";
import { show } from "../result/news/show.ts";
import { create } from "../result/news/create.ts";
import { update } from "../result/news/update.ts";
import { deleteNews } from "../result/news/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: News API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project).toBeDefined();

    await t.step("GET /news.json should return the seeded news", async () => {
      const result = await fetchList(e2eContext);
      expect(result.isOk()).toBe(true);
      const seeded = result._unsafeUnwrap().find((n) => n.title === "E2E News");
      expect(seeded).toBeDefined();
      expect(seeded!.summary).toStrictEqual("E2E news summary");
      expect(seeded!.description).toStrictEqual("E2E news description");
      expect(seeded!.project).toBeDefined();
      expect(seeded!.author).toBeDefined();
      expect(seeded!.createdOn).toBeInstanceOf(Date);
    });

    await t.step(
      "GET /projects/:project_id/news.json should return the project news",
      async () => {
        const result = await fetchListByProject(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        const seeded = result._unsafeUnwrap().find((n) =>
          n.title === "E2E News"
        );
        expect(seeded).toBeDefined();
        // A news created without a summary is rendered as an empty string
        // (not null), which is why the schema keeps `summary` a required string.
        const noSummary = result._unsafeUnwrap().find((n) =>
          n.title === "E2E News Without Summary"
        );
        expect(noSummary).toBeDefined();
        expect(noSummary!.summary).toStrictEqual("");
      },
    );

    await t.step(
      "POST /projects/:project_id/news.json should create a news",
      async () => {
        const result = await create(e2eContext, project!.id, {
          title: "E2E Created News",
          summary: "E2E created summary",
          description: "E2E created description",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    const findByTitle = async (title: string) => {
      const result = await fetchListByProject(e2eContext, project!.id);
      expect(result.isOk()).toBe(true);
      return result._unsafeUnwrap().find((n) => n.title === title);
    };

    await t.step(
      "GET /news/:id.json should return the created news",
      async () => {
        const created = await findByTitle("E2E Created News");
        expect(created).toBeDefined();

        const result = await show(e2eContext, created!.id);
        expect(result.isOk()).toBe(true);
        const shown = result._unsafeUnwrap();
        expect(shown.id).toStrictEqual(created!.id);
        expect(shown.title).toStrictEqual("E2E Created News");
        expect(shown.description).toStrictEqual("E2E created description");
        expect(shown.project).toBeDefined();
        expect(shown.author).toBeDefined();
      },
    );

    await t.step(
      "PUT /news/:id.json should update the news",
      async () => {
        const created = await findByTitle("E2E Created News");
        expect(created).toBeDefined();

        const result = await update(e2eContext, created!.id, {
          title: "E2E Updated News",
        });
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, created!.id);
        expect(showResult.isOk()).toBe(true);
        expect(showResult._unsafeUnwrap().title).toStrictEqual(
          "E2E Updated News",
        );
      },
    );

    await t.step(
      "DELETE /news/:id.json should delete the news",
      async () => {
        const updated = await findByTitle("E2E Updated News");
        expect(updated).toBeDefined();

        const result = await deleteNews(e2eContext, updated!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, updated!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
