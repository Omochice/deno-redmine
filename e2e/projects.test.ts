import { assert, assertEquals } from "jsr:@std/assert@1.0.18";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/projects/list.ts";
import { show } from "../result/projects/show.ts";
import { create } from "../result/projects/create.ts";
import { update } from "../result/projects/update.ts";
import { deleteProject } from "../result/projects/delete.ts";
import { archive, unarchive } from "../result/projects/archive.ts";

Deno.test({
  name: "E2E: Projects API",
  sanitizeResources: false,
  fn: async (t) => {
    await t.step("GET /projects.json should return projects", async () => {
      const result = await fetchList(e2eContext);
      assert(result.isOk());
      assert(result.value.length > 0);
    });

    await t.step("GET /projects/:id.json should return a project", async () => {
      const listResult = await fetchList(e2eContext);
      assert(listResult.isOk());
      assert(listResult.value.length > 0);
      const projectId = listResult.value[0].id;

      const result = await show(e2eContext, projectId);
      assert(result.isOk());
      assertEquals(result.value.id, projectId);
      assert(typeof result.value.name === "string");
      assert(typeof result.value.identifier === "string");
    });

    await t.step("POST /projects.json should create a project", async () => {
      const result = await create(e2eContext, {
        name: "E2E Created Project",
        identifier: "e2e-created-project",
      });
      assert(result.isOk());
    });

    await t.step("PUT /projects/:id.json should update a project", async () => {
      const listResult = await fetchList(e2eContext);
      assert(listResult.isOk());
      const project = listResult.value.find((p) =>
        p.identifier === "e2e-created-project"
      );
      assert(project !== undefined);

      const result = await update(e2eContext, project.id, {
        name: "E2E Updated Project",
      });
      assert(result.isOk());

      const showResult = await show(e2eContext, project.id);
      assert(showResult.isOk());
      assertEquals(showResult.value.name, "E2E Updated Project");
    });

    await t.step(
      "PUT /projects/:id/archive.json should archive and unarchive",
      async () => {
        const listResult = await fetchList(e2eContext);
        assert(listResult.isOk());
        const project = listResult.value.find((p) =>
          p.identifier === "e2e-created-project"
        );
        assert(project !== undefined);

        const archiveResult = await archive(e2eContext, project.id);
        assert(
          archiveResult.isOk(),
          "Expected archive to succeed",
        );

        const unarchiveResult = await unarchive(e2eContext, project.id);
        assert(
          unarchiveResult.isOk(),
          "Expected unarchive to succeed",
        );
      },
    );

    await t.step(
      "DELETE /projects/:id.json should delete a project",
      async () => {
        const listResult = await fetchList(e2eContext);
        assert(listResult.isOk());
        const project = listResult.value.find((p) =>
          p.identifier === "e2e-created-project"
        );
        assert(project !== undefined);

        const result = await deleteProject(e2eContext, project.id);
        assert(result.isOk());
      },
    );
  },
});
