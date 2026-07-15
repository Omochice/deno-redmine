import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/projects/list.ts";
import { show } from "../result/projects/show.ts";
import { create } from "../result/projects/create.ts";
import { update } from "../result/projects/update.ts";
import { deleteProject } from "../result/projects/delete.ts";
import { archive, unarchive } from "../result/projects/archive.ts";

Deno.test({
  name: "E2E: Projects API",
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
      "snake_case attributes reach the server on create and update",
      async () => {
        const identifier = `e2e-serialization-${Date.now()}`;
        const createResult = await create(e2eContext, {
          name: "E2E Serialization Project",
          identifier,
          isPublic: false,
        });
        assert(createResult.isOk());

        // Cleanup re-resolves the project by identifier instead of reusing
        // an id from the try block: that id is unavailable exactly when the
        // lookup is the step that failed.
        try {
          const listResult = await fetchList(e2eContext);
          assert(listResult.isOk());
          const created = listResult.value.find((p) =>
            p.identifier === identifier
          );
          assert(created !== undefined);

          const createdShow = await show(e2eContext, created.id);
          assert(createdShow.isOk());
          assertEquals(
            createdShow.value.isPublic,
            false,
            "isPublic:false must be stored as private on the server",
          );

          const updateResult = await update(e2eContext, created.id, {
            isPublic: true,
          });
          assert(updateResult.isOk());

          const updatedShow = await show(e2eContext, created.id);
          assert(updatedShow.isOk());
          assertEquals(
            updatedShow.value.isPublic,
            true,
            "update must flip is_public on the server",
          );
        } finally {
          const cleanupList = await fetchList(e2eContext);
          if (cleanupList.isOk()) {
            const leftover = cleanupList.value.find((p) =>
              p.identifier === identifier
            );
            if (leftover !== undefined) {
              await deleteProject(e2eContext, leftover.id);
            }
          }
        }
      },
    );

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
