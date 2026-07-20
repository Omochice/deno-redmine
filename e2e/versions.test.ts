import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../versions/list.ts";
import { show } from "../versions/show.ts";
import { create } from "../versions/create.ts";
import { update } from "../versions/update.ts";
import { deleteVersion } from "../versions/delete.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Versions API",
  fn: async (t) => {
    const projects = await listProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    await t.step(
      "POST /projects/:project_id/versions.json should create a version",
      async () => {
        await create(e2eContext, project!.id, {
          name: "E2E Created Version",
          status: "open",
          sharing: "none",
          description: "Created by E2E test",
          dueDate: new Date("2026-08-01"),
        });
      },
    );

    await t.step(
      "GET /projects/:project_id/versions.json should return versions",
      async () => {
        const versions = await list(e2eContext, project!.id);
        expect(versions.length).toBeGreaterThan(0);
        const created = versions.find((v) => v.name === "E2E Created Version");
        expect(created).toBeDefined();
      },
    );

    await t.step("GET /versions/:id.json should return a version", async () => {
      const versions = await list(e2eContext, project!.id);
      const version = versions.find((v) => v.name === "E2E Created Version");
      expect(version).toBeDefined();

      const shown = await show(e2eContext, version!.id);
      expect(shown.id).toStrictEqual(version!.id);
      expect(shown.name).toStrictEqual("E2E Created Version");
      expect(shown.project).toBeDefined();
      expect(shown.status).toStrictEqual("open");
    });

    await t.step("PUT /versions/:id.json should update a version", async () => {
      const versions = await list(e2eContext, project!.id);
      const version = versions.find((v) => v.name === "E2E Created Version");
      expect(version).toBeDefined();

      await update(e2eContext, version!.id, {
        name: "E2E Updated Version",
        status: "locked",
      });

      const shown = await show(e2eContext, version!.id);
      expect(shown.name).toStrictEqual("E2E Updated Version");
      expect(shown.status).toStrictEqual("locked");
    });

    await t.step(
      "DELETE /versions/:id.json should delete a version",
      async () => {
        const versions = await list(e2eContext, project!.id);
        const version = versions.find((v) => v.name === "E2E Updated Version");
        expect(version).toBeDefined();

        await deleteVersion(e2eContext, version!.id);

        await expect(show(e2eContext, version!.id)).rejects.toThrow();
      },
    );
  },
});
