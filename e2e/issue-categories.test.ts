import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../issue-categories/list.ts";
import { show } from "../issue-categories/show.ts";
import { create } from "../issue-categories/create.ts";
import { update } from "../issue-categories/update.ts";
import { deleteIssueCategory } from "../issue-categories/delete.ts";
import { list as fetchProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Issue Categories API",
  fn: async (t) => {
    const projects = await fetchProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    await t.step(
      "POST /projects/:project_id/issue_categories.json should create an issue category",
      async () => {
        await create(e2eContext, project!.id, {
          name: "E2E Created Category",
        });
      },
    );

    await t.step(
      "GET /projects/:project_id/issue_categories.json should return issue categories",
      async () => {
        const categories = await list(e2eContext, project!.id);
        expect(categories.length).toBeGreaterThan(0);
        const created = categories.find((c) =>
          c.name === "E2E Created Category"
        );
        expect(created).toBeDefined();
      },
    );

    await t.step(
      "GET /issue_categories/:id.json should return an issue category",
      async () => {
        const categories = await list(e2eContext, project!.id);
        const category = categories.find((c) =>
          c.name === "E2E Created Category"
        );
        expect(category).toBeDefined();

        const shown = await show(e2eContext, category!.id);
        expect(shown.id).toStrictEqual(category!.id);
        expect(shown.name).toStrictEqual(
          "E2E Created Category",
        );
        expect(shown.project).toBeDefined();
      },
    );

    await t.step(
      "PUT /issue_categories/:id.json should update an issue category",
      async () => {
        const categories = await list(e2eContext, project!.id);
        const category = categories.find((c) =>
          c.name === "E2E Created Category"
        );
        expect(category).toBeDefined();

        await update(e2eContext, category!.id, {
          name: "E2E Updated Category",
        });

        const shown = await show(e2eContext, category!.id);
        expect(shown.name).toStrictEqual(
          "E2E Updated Category",
        );
      },
    );

    await t.step(
      "DELETE /issue_categories/:id.json should delete an issue category",
      async () => {
        const categories = await list(e2eContext, project!.id);
        const category = categories.find((c) =>
          c.name === "E2E Updated Category"
        );
        expect(category).toBeDefined();

        await deleteIssueCategory(e2eContext, category!.id);

        await expect(show(e2eContext, category!.id)).rejects.toThrow();
      },
    );
  },
});
