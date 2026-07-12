import { assert, assertEquals } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/versions/list.ts";
import { show } from "../result/versions/show.ts";
import { create } from "../result/versions/create.ts";
import { update } from "../result/versions/update.ts";
import { deleteVersion } from "../result/versions/delete.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Versions API",
  // Library functions may not fully consume fetch response bodies, triggering
  // Deno's resource sanitizer as a false positive.
  sanitizeResources: false,
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    await t.step(
      "POST /projects/:project_id/versions.json should create a version",
      async () => {
        const result = await create(e2eContext, project.id, {
          name: "E2E Created Version",
          status: "open",
          sharing: "none",
          description: "Created by E2E test",
          dueDate: new Date("2026-08-01"),
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /projects/:project_id/versions.json should return versions",
      async () => {
        const result = await fetchList(e2eContext, project.id);
        assert(result.isOk());
        assert(result.value.length > 0);
        const created = result.value.find((v) =>
          v.name === "E2E Created Version"
        );
        assert(created !== undefined);
      },
    );

    await t.step("GET /versions/:id.json should return a version", async () => {
      const listResult = await fetchList(e2eContext, project.id);
      assert(listResult.isOk());
      const version = listResult.value.find((v) =>
        v.name === "E2E Created Version"
      );
      assert(version !== undefined);

      const result = await show(e2eContext, version.id);
      assert(result.isOk());
      assertEquals(result.value.id, version.id);
      assertEquals(result.value.name, "E2E Created Version");
      assert(result.value.project !== undefined);
      assertEquals(result.value.status, "open");
    });

    await t.step("PUT /versions/:id.json should update a version", async () => {
      const listResult = await fetchList(e2eContext, project.id);
      assert(listResult.isOk());
      const version = listResult.value.find((v) =>
        v.name === "E2E Created Version"
      );
      assert(version !== undefined);

      const result = await update(e2eContext, version.id, {
        name: "E2E Updated Version",
        status: "locked",
      });
      assert(result.isOk());

      const showResult = await show(e2eContext, version.id);
      assert(showResult.isOk());
      assertEquals(showResult.value.name, "E2E Updated Version");
      assertEquals(showResult.value.status, "locked");
    });

    await t.step(
      "DELETE /versions/:id.json should delete a version",
      async () => {
        const listResult = await fetchList(e2eContext, project.id);
        assert(listResult.isOk());
        const version = listResult.value.find((v) =>
          v.name === "E2E Updated Version"
        );
        assert(version !== undefined);

        const result = await deleteVersion(e2eContext, version.id);
        assert(result.isOk());

        const showResult = await show(e2eContext, version.id);
        assert(showResult.isErr());
      },
    );
  },
});
