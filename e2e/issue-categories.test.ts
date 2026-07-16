import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
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
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    await t.step(
      "POST /projects/:project_id/issue_categories.json should create an issue category",
      async () => {
        const result = await create(e2eContext, project.id, {
          name: "E2E Created Category",
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /projects/:project_id/issue_categories.json should return issue categories",
      async () => {
        const result = await fetchList(e2eContext, project.id);
        assert(result.isOk());
        assert(result.value.length > 0);
        const created = result.value.find((c) =>
          c.name === "E2E Created Category"
        );
        assert(created !== undefined);
      },
    );

    await t.step(
      "GET /issue_categories/:id.json should return an issue category",
      async () => {
        const listResult = await fetchList(e2eContext, project.id);
        assert(listResult.isOk());
        const category = listResult.value.find((c) =>
          c.name === "E2E Created Category"
        );
        assert(category !== undefined);

        const result = await show(e2eContext, category.id);
        assert(result.isOk());
        assertEquals(result.value.id, category.id);
        assertEquals(result.value.name, "E2E Created Category");
        assert(result.value.project !== undefined);
      },
    );

    await t.step(
      "PUT /issue_categories/:id.json should update an issue category",
      async () => {
        const listResult = await fetchList(e2eContext, project.id);
        assert(listResult.isOk());
        const category = listResult.value.find((c) =>
          c.name === "E2E Created Category"
        );
        assert(category !== undefined);

        const result = await update(e2eContext, category.id, {
          name: "E2E Updated Category",
        });
        assert(result.isOk());

        const showResult = await show(e2eContext, category.id);
        assert(showResult.isOk());
        assertEquals(showResult.value.name, "E2E Updated Category");
      },
    );

    await t.step(
      "DELETE /issue_categories/:id.json should delete an issue category",
      async () => {
        const listResult = await fetchList(e2eContext, project.id);
        assert(listResult.isOk());
        const category = listResult.value.find((c) =>
          c.name === "E2E Updated Category"
        );
        assert(category !== undefined);

        const result = await deleteIssueCategory(e2eContext, category.id);
        assert(result.isOk());

        const showResult = await show(e2eContext, category.id);
        assert(showResult.isErr());
      },
    );
  },
});
