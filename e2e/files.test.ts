import { assert } from "jsr:@std/assert@1.0.19";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/files/list.ts";
import { create } from "../result/files/create.ts";
import { upload } from "../result/files/upload.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Files API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    assert(projectsResult.isOk());
    const project = projectsResult.value.find((p) =>
      p.identifier === "e2e-test-project"
    );
    assert(project !== undefined);

    const filename = "e2e-file.txt";

    let token: string | undefined;
    await t.step(
      "POST /uploads.json should return an upload token",
      async () => {
        const result = await upload(
          e2eContext,
          new TextEncoder().encode("e2e file content"),
          filename,
        );
        assert(result.isOk());
        token = result.value;
      },
    );

    await t.step(
      "POST /projects/:project_id/files.json should create a file",
      async () => {
        assert(token !== undefined);
        const result = await create(e2eContext, project.id, {
          token,
          filename,
          description: "Created by E2E test",
        });
        assert(result.isOk());
      },
    );

    await t.step(
      "GET /projects/:project_id/files.json should return files",
      async () => {
        const result = await fetchList(e2eContext, project.id);
        assert(result.isOk());
        const created = result.value.find((f) => f.filename === filename);
        assert(created !== undefined);
      },
    );
  },
});
