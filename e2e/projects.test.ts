import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../throwable/projects/list.ts";
import { show } from "../throwable/projects/show.ts";
import { create } from "../throwable/projects/create.ts";
import { update } from "../throwable/projects/update.ts";
import { deleteProject } from "../throwable/projects/delete.ts";
import { archive, unarchive } from "../throwable/projects/archive.ts";
import { close, reopen } from "../throwable/projects/close.ts";

Deno.test({
  name: "E2E: Projects API",
  fn: async (t) => {
    await t.step("GET /projects.json should return projects", async () => {
      const projects = await fetchList(e2eContext);
      expect(projects.length).toBeGreaterThan(0);
    });

    await t.step("GET /projects/:id.json should return a project", async () => {
      const projects = await fetchList(e2eContext);
      expect(projects.length).toBeGreaterThan(0);
      const projectId = projects[0].id;

      const project = await show(e2eContext, projectId);
      expect(project.id).toStrictEqual(projectId);
    });

    await t.step("POST /projects.json should create a project", async () => {
      await create(e2eContext, {
        name: "E2E Created Project",
        identifier: "e2e-created-project",
      });
    });

    await t.step("PUT /projects/:id.json should update a project", async () => {
      const projects = await fetchList(e2eContext);
      const project = projects.find((p) =>
        p.identifier === "e2e-created-project"
      );
      expect(project).toBeDefined();

      await update(e2eContext, project!.id, {
        name: "E2E Updated Project",
      });

      const updated = await show(e2eContext, project!.id);
      expect(updated.name).toStrictEqual(
        "E2E Updated Project",
      );
    });

    await t.step(
      "snake_case attributes reach the server on create and update",
      async () => {
        const identifier = `e2e-serialization-${Date.now()}`;
        await create(e2eContext, {
          name: "E2E Serialization Project",
          identifier,
          isPublic: false,
        });

        // Cleanup re-resolves the project by identifier instead of reusing
        // an id from the try block: that id is unavailable exactly when the
        // lookup is the step that failed.
        try {
          const projects = await fetchList(e2eContext);
          const created = projects.find((p) => p.identifier === identifier);
          expect(created).toBeDefined();

          const createdShow = await show(e2eContext, created!.id);
          expect(
            createdShow.isPublic,
            "isPublic:false must be stored as private on the server",
          ).toStrictEqual(false);

          await update(e2eContext, created!.id, {
            isPublic: true,
          });

          const updatedShow = await show(e2eContext, created!.id);
          expect(
            updatedShow.isPublic,
            "update must flip is_public on the server",
          ).toStrictEqual(true);
        } finally {
          try {
            const cleanupList = await fetchList(e2eContext);
            const leftover = cleanupList.find((p) =>
              p.identifier === identifier
            );
            if (leftover !== undefined) {
              await deleteProject(e2eContext, leftover.id);
            }
          } catch {
            // Cleanup is best-effort: a failed lookup or delete must not
            // mask the assertion failure that triggered this finally block.
          }
        }
      },
    );

    await t.step(
      "PUT /projects/:id/archive.json should archive and unarchive",
      async () => {
        const projects = await fetchList(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-created-project"
        );
        expect(project).toBeDefined();

        await archive(e2eContext, project!.id);
        await unarchive(e2eContext, project!.id);
      },
    );

    await t.step(
      "PUT /projects/:id/close.json should close and reopen",
      async () => {
        const projects = await fetchList(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-created-project"
        );
        expect(project).toBeDefined();

        await close(e2eContext, project!.id);
        await reopen(e2eContext, project!.id);
      },
    );

    await t.step(
      "DELETE /projects/:id.json should delete a project",
      async () => {
        const projects = await fetchList(e2eContext);
        const project = projects.find((p) =>
          p.identifier === "e2e-created-project"
        );
        expect(project).toBeDefined();

        await deleteProject(e2eContext, project!.id);
      },
    );
  },
});
