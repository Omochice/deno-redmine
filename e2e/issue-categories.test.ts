import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/issue-categories/list.ts";
import { show } from "../result/issue-categories/show.ts";
import { create } from "../result/issue-categories/create.ts";
import { update } from "../result/issue-categories/update.ts";
import { deleteIssueCategory } from "../result/issue-categories/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Issue Categories API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project).toBeDefined();

    await t.step(
      "POST /projects/:project_id/issue_categories.json should create an issue category",
      async () => {
        const result = await create(e2eContext, project!.id, {
          name: "E2E Created Category",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /projects/:project_id/issue_categories.json should return issue categories",
      async () => {
        const result = await fetchList(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length).toBeGreaterThan(0);
        const created = result._unsafeUnwrap().find((c) =>
          c.name === "E2E Created Category"
        );
        expect(created).toBeDefined();
      },
    );

    await t.step(
      "GET /issue_categories/:id.json should return an issue category",
      async () => {
        const listResult = await fetchList(e2eContext, project!.id);
        expect(listResult.isOk()).toBe(true);
        const category = listResult._unsafeUnwrap().find((c) =>
          c.name === "E2E Created Category"
        );
        expect(category).toBeDefined();

        const result = await show(e2eContext, category!.id);
        expect(result.isOk()).toBe(true);
        const shown = result._unsafeUnwrap();
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
        const listResult = await fetchList(e2eContext, project!.id);
        expect(listResult.isOk()).toBe(true);
        const category = listResult._unsafeUnwrap().find((c) =>
          c.name === "E2E Created Category"
        );
        expect(category).toBeDefined();

        const result = await update(e2eContext, category!.id, {
          name: "E2E Updated Category",
        });
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, category!.id);
        expect(showResult.isOk()).toBe(true);
        expect(showResult._unsafeUnwrap().name).toStrictEqual(
          "E2E Updated Category",
        );
      },
    );

    await t.step(
      "DELETE /issue_categories/:id.json should delete an issue category",
      async () => {
        const listResult = await fetchList(e2eContext, project!.id);
        expect(listResult.isOk()).toBe(true);
        const category = listResult._unsafeUnwrap().find((c) =>
          c.name === "E2E Updated Category"
        );
        expect(category).toBeDefined();

        const result = await deleteIssueCategory(e2eContext, category!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, category!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
