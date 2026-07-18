import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/wiki-pages/list.ts";
import { show } from "../result/wiki-pages/show.ts";
import { create } from "../result/wiki-pages/create.ts";
import { deleteWiki } from "../result/wiki-pages/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Wiki Pages API",
  fn: async (t) => {
    let projectId: number;

    await t.step("resolve test project", async () => {
      const projectsResult = await fetchProjects(e2eContext);
      expect(projectsResult.isOk()).toBe(true);
      const project = projectsResult._unsafeUnwrap().find((p) =>
        p.identifier === "e2e-test-project"
      );
      expect(project).toBeDefined();
      projectId = project!.id;
    });

    await t.step(
      "GET /projects/:id/wiki/index.json should return wiki pages",
      async () => {
        const result = await fetchList(e2eContext, projectId);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length).toBeGreaterThan(0);
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page",
      async () => {
        const result = await show(e2eContext, projectId, "E2ETestPage");
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().title).toStrictEqual("E2ETestPage");
        expect(result._unsafeUnwrap().version).toBeGreaterThanOrEqual(1);
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
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page with comments",
      async () => {
        const result = await show(e2eContext, projectId, "E2ECreatedPage");
        expect(result.isOk()).toBe(true);
        const page = result._unsafeUnwrap();
        expect(page.title).toStrictEqual("E2ECreatedPage");
        expect(page.text).toStrictEqual(
          "Created by E2E test",
        );
        expect(page.version).toBeGreaterThanOrEqual(1);
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
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, projectId, "E2ECreatedPage");
        expect(showResult.isOk()).toBe(true);
        expect(showResult._unsafeUnwrap().text.includes("Updated by E2E test"))
          .toBe(
            true,
          );
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
        expect(result.isOk()).toBe(true);
      },
    );
  },
});
