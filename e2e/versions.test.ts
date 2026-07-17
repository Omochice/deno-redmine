import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/versions/list.ts";
import { show } from "../result/versions/show.ts";
import { create } from "../result/versions/create.ts";
import { update } from "../result/versions/update.ts";
import { deleteVersion } from "../result/versions/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Versions API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project !== undefined).toBe(true);

    await t.step(
      "POST /projects/:project_id/versions.json should create a version",
      async () => {
        const result = await create(e2eContext, project!.id, {
          name: "E2E Created Version",
          status: "open",
          sharing: "none",
          description: "Created by E2E test",
          dueDate: new Date("2026-08-01"),
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /projects/:project_id/versions.json should return versions",
      async () => {
        const result = await fetchList(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().length > 0).toBe(true);
        const created = result._unsafeUnwrap().find((v) =>
          v.name === "E2E Created Version"
        );
        expect(created !== undefined).toBe(true);
      },
    );

    await t.step("GET /versions/:id.json should return a version", async () => {
      const listResult = await fetchList(e2eContext, project!.id);
      expect(listResult.isOk()).toBe(true);
      const version = listResult._unsafeUnwrap().find((v) =>
        v.name === "E2E Created Version"
      );
      expect(version !== undefined).toBe(true);

      const result = await show(e2eContext, version!.id);
      expect(result.isOk()).toBe(true);
      expect(result._unsafeUnwrap().id).toEqual(version!.id);
      expect(result._unsafeUnwrap().name).toEqual("E2E Created Version");
      expect(result._unsafeUnwrap().project !== undefined).toBe(true);
      expect(result._unsafeUnwrap().status).toEqual("open");
    });

    await t.step("PUT /versions/:id.json should update a version", async () => {
      const listResult = await fetchList(e2eContext, project!.id);
      expect(listResult.isOk()).toBe(true);
      const version = listResult._unsafeUnwrap().find((v) =>
        v.name === "E2E Created Version"
      );
      expect(version !== undefined).toBe(true);

      const result = await update(e2eContext, version!.id, {
        name: "E2E Updated Version",
        status: "locked",
      });
      expect(result.isOk()).toBe(true);

      const showResult = await show(e2eContext, version!.id);
      expect(showResult.isOk()).toBe(true);
      expect(showResult._unsafeUnwrap().name).toEqual("E2E Updated Version");
      expect(showResult._unsafeUnwrap().status).toEqual("locked");
    });

    await t.step(
      "DELETE /versions/:id.json should delete a version",
      async () => {
        const listResult = await fetchList(e2eContext, project!.id);
        expect(listResult.isOk()).toBe(true);
        const version = listResult._unsafeUnwrap().find((v) =>
          v.name === "E2E Updated Version"
        );
        expect(version !== undefined).toBe(true);

        const result = await deleteVersion(e2eContext, version!.id);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, version!.id);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
