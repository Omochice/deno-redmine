import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../news/list.ts";
import { listByProject } from "../news/list-by-project.ts";
import { show } from "../news/show.ts";
import { create } from "../news/create.ts";
import { update } from "../news/update.ts";
import { deleteNews } from "../news/delete.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: News API",
  fn: async (t) => {
    const projects = await Array.fromAsync(listProjects(e2eContext));
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    await t.step("GET /news.json should return the seeded news", async () => {
      const news = await Array.fromAsync(list(e2eContext));
      const seeded = news.find((n) => n.title === "E2E News");
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
        const news = await Array.fromAsync(
          listByProject(e2eContext, project!.id),
        );
        const seeded = news.find((n) => n.title === "E2E News");
        expect(seeded).toBeDefined();
        // A news created without a summary is rendered as an empty string
        // (not null), which is why the schema keeps `summary` a required string.
        const noSummary = news.find((n) =>
          n.title === "E2E News Without Summary"
        );
        expect(noSummary).toBeDefined();
        expect(noSummary!.summary).toStrictEqual("");
      },
    );

    await t.step(
      "POST /projects/:project_id/news.json should create a news",
      async () => {
        await create(e2eContext, project!.id, {
          title: "E2E Created News",
          summary: "E2E created summary",
          description: "E2E created description",
        });
      },
    );

    const findByTitle = async (title: string) => {
      const news = await Array.fromAsync(
        listByProject(e2eContext, project!.id),
      );
      return news.find((n) => n.title === title);
    };

    await t.step(
      "GET /news/:id.json should return the created news",
      async () => {
        const created = await findByTitle("E2E Created News");
        expect(created).toBeDefined();

        const shown = await show(e2eContext, created!.id);
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

        await update(e2eContext, created!.id, {
          title: "E2E Updated News",
        });

        const shown = await show(e2eContext, created!.id);
        expect(shown.title).toStrictEqual(
          "E2E Updated News",
        );
      },
    );

    await t.step(
      "DELETE /news/:id.json should delete the news",
      async () => {
        const updated = await findByTitle("E2E Updated News");
        expect(updated).toBeDefined();

        await deleteNews(e2eContext, updated!.id);

        await expect(show(e2eContext, updated!.id)).rejects.toThrow();
      },
    );
  },
});
