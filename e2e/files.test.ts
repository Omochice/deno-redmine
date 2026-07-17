import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../result/files/list.ts";
import { create } from "../result/files/create.ts";
import { upload } from "../result/files/upload.ts";
import { fetchList as fetchProjects } from "../result/projects/list.ts";

Deno.test({
  name: "E2E: Files API",
  fn: async (t) => {
    const projectsResult = await fetchProjects(e2eContext);
    expect(projectsResult.isOk()).toBe(true);
    const project = projectsResult._unsafeUnwrap().find((p) =>
      p.identifier === "e2e-test-project"
    );
    expect(project !== undefined).toBe(true);

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
        expect(result.isOk()).toBe(true);
        token = result._unsafeUnwrap();
      },
    );

    await t.step(
      "POST /projects/:project_id/files.json should create a file",
      async () => {
        expect(token !== undefined).toBe(true);
        const result = await create(e2eContext, project!.id, {
          token: token!,
          filename,
          description: "Created by E2E test",
        });
        expect(result.isOk()).toBe(true);
      },
    );

    await t.step(
      "GET /projects/:project_id/files.json should return files",
      async () => {
        const result = await fetchList(e2eContext, project!.id);
        expect(result.isOk()).toBe(true);
        const created = result._unsafeUnwrap().find((f) =>
          f.filename === filename
        );
        expect(created !== undefined).toBe(true);
      },
    );
  },
});
