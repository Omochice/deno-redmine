import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { fetchList } from "../throwable/files/list.ts";
import { create } from "../throwable/files/create.ts";
import { upload } from "../throwable/files/upload.ts";
import { fetchList as fetchProjects } from "../throwable/projects/list.ts";

Deno.test({
  name: "E2E: Files API",
  fn: async (t) => {
    const projects = await fetchProjects(e2eContext);
    const project = projects.find((p) => p.identifier === "e2e-test-project");
    expect(project).toBeDefined();

    const filename = "e2e-file.txt";

    let token: string | undefined;
    await t.step(
      "POST /uploads.json should return an upload token",
      async () => {
        token = await upload(
          e2eContext,
          new TextEncoder().encode("e2e file content"),
          filename,
        );
      },
    );

    await t.step(
      "POST /projects/:project_id/files.json should create a file",
      async () => {
        expect(token).toBeDefined();
        await create(e2eContext, project!.id, {
          token: token!,
          filename,
          description: "Created by E2E test",
        });
      },
    );

    await t.step(
      "GET /projects/:project_id/files.json should return files",
      async () => {
        const files = await fetchList(e2eContext, project!.id);
        const created = files.find((f) => f.filename === filename);
        expect(created).toBeDefined();
      },
    );
  },
});
