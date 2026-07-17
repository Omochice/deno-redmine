import { expect } from "jsr:@std/expect@1.0.20";
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
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().length > 0).toBe(true);
    });

    await t.step("GET /projects/:id.json should return a project", async () => {
      const listResult = await fetchList(e2eContext);
      expect(listResult.isOk()).toBe(true);
      expect(listResult._unsafeUnwrap().length > 0).toBe(true);
      const projectId = listResult._unsafeUnwrap()[0].id;

      const result = await show(e2eContext, projectId);
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().id).toEqual(projectId);
    });

    await t.step("POST /projects.json should create a project", async () => {
      const result = await create(e2eContext, {
        name: "E2E Created Project",
        identifier: "e2e-created-project",
      });
      expect(result.isOk()).toBe(true);
    });

    await t.step("PUT /projects/:id.json should update a project", async () => {
      const listResult = await fetchList(e2eContext);
      expect(listResult.isOk()).toBe(true);
      const project = listResult._unsafeUnwrap().find((p) =>
        p.identifier === "e2e-created-project"
      );
      expect(project !== undefined).toBe(true);

      const result = await update(e2eContext, project!.id, {
        name: "E2E Updated Project",
      });
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, project!.id);
      expect(showResult.isOk()).toBe(true);
      expect(showResult._unsafeUnwrap().name).toEqual("E2E Updated Project");
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
        expect(createResult.isOk()).toBe(true);

        // Cleanup re-resolves the project by identifier instead of reusing
        // an id from the try block: that id is unavailable exactly when the
        // lookup is the step that failed.
        try {
          const listResult = await fetchList(e2eContext);
          expect(listResult.isOk()).toBe(true);
          const created = listResult._unsafeUnwrap().find((p) =>
            p.identifier === identifier
          );
          expect(created !== undefined).toBe(true);

          const createdShow = await show(e2eContext, created!.id);
          expect(createdShow.isOk()).toBe(true);
          expect(
            createdShow._unsafeUnwrap().isPublic,
            "isPublic:false must be stored as private on the server",
          ).toEqual(false);

          const updateResult = await update(e2eContext, created!.id, {
            isPublic: true,
          });
          expect(updateResult.isOk()).toBe(true);

          const updatedShow = await show(e2eContext, created!.id);
          expect(updatedShow.isOk()).toBe(true);
          expect(
            updatedShow._unsafeUnwrap().isPublic,
            "update must flip is_public on the server",
          ).toEqual(true);
        } finally {
          const cleanupList = await fetchList(e2eContext);
          if (cleanupList.isOk()) {
            const leftover = cleanupList._unsafeUnwrap().find((p) =>
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
        expect(listResult.isOk()).toBe(true);
        const project = listResult._unsafeUnwrap().find((p) =>
          p.identifier === "e2e-created-project"
        );
        expect(project !== undefined).toBe(true);

        const archiveResult = await archive(e2eContext, project!.id);
        expect(archiveResult.isOk(), "Expected archive to succeed").toBe(true);

        const unarchiveResult = await unarchive(e2eContext, project!.id);
        expect(unarchiveResult.isOk(), "Expected unarchive to succeed").toBe(
          true,
        );
      },
    );

    await t.step(
      "DELETE /projects/:id.json should delete a project",
      async () => {
        const listResult = await fetchList(e2eContext);
        expect(listResult.isOk()).toBe(true);
        const project = listResult._unsafeUnwrap().find((p) =>
          p.identifier === "e2e-created-project"
        );
        expect(project !== undefined).toBe(true);

        const result = await deleteProject(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
      },
    );
  },
});
