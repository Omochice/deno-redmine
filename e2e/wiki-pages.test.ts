import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { list } from "../wiki-pages/list.ts";
import { show } from "../wiki-pages/show.ts";
import { create } from "../wiki-pages/create.ts";
import { deleteWiki } from "../wiki-pages/delete.ts";
import { upload } from "../files/upload.ts";
import { list as listProjects } from "../projects/list.ts";

Deno.test({
  name: "E2E: Wiki Pages API",
  fn: async (t) => {
    let projectId: number;

    await t.step("resolve test project", async () => {
      const projects = await listProjects(e2eContext);
      const project = projects.find((p) => p.identifier === "e2e-test-project");
      expect(project).toBeDefined();
      projectId = project!.id;
    });

    await t.step(
      "GET /projects/:id/wiki/index.json should return wiki pages",
      async () => {
        const pages = await list(e2eContext, projectId);
        expect(pages.length).toBeGreaterThan(0);
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page",
      async () => {
        const page = await show(e2eContext, {
          projectId,
          title: "E2ETestPage",
        });
        expect(page.title).toStrictEqual("E2ETestPage");
        expect(page.version).toBeGreaterThanOrEqual(1);
      },
    );

    await t.step(
      "PUT /projects/:id/wiki/:page.json should create a wiki page",
      async () => {
        await create(e2eContext, projectId, {
          title: "E2ECreatedPage",
          text: "Created by E2E test",
          comments: "E2E test creation",
        });
      },
    );

    await t.step(
      "GET /projects/:id/wiki/:page.json should return a wiki page with comments",
      async () => {
        const page = await show(e2eContext, {
          projectId,
          title: "E2ECreatedPage",
        });
        expect(page.title).toStrictEqual("E2ECreatedPage");
        expect(page.text).toStrictEqual(
          "Created by E2E test",
        );
        expect(page.version).toBeGreaterThanOrEqual(1);
      },
    );

    await t.step(
      "PUT /projects/:id/wiki/:page.json should update an existing wiki page",
      async () => {
        await create(e2eContext, projectId, {
          title: "E2ECreatedPage",
          text: "Updated by E2E test",
          comments: "E2E test update",
        });

        const page = await show(e2eContext, {
          projectId,
          title: "E2ECreatedPage",
        });
        expect(page.text.includes("Updated by E2E test"))
          .toBe(
            true,
          );
      },
    );

    await t.step(
      "PUT with uploads should attach a file readable via include=attachments",
      async () => {
        const token = await upload(
          e2eContext,
          new TextEncoder().encode("e2e attachment content"),
          "e2e-attachment.txt",
        );

        await create(e2eContext, projectId, {
          title: "E2ECreatedPage",
          text: "Updated by E2E test with attachment",
          uploads: [
            {
              token,
              filename: "e2e-attachment.txt",
              contentType: "text/plain",
            },
          ],
        });

        const page = await show(e2eContext, {
          projectId,
          title: "E2ECreatedPage",
          includes: ["attachments"],
        });
        const attachments = page.attachments;
        expect(attachments).toBeDefined();
        expect(attachments!.some((a) => a.filename === "e2e-attachment.txt"))
          .toBe(true);
      },
    );

    await t.step(
      "DELETE /projects/:id/wiki/:page.json should delete a wiki page",
      async () => {
        await deleteWiki(
          e2eContext,
          projectId,
          "E2ECreatedPage",
        );
      },
    );
  },
});
