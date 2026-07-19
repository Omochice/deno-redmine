import { addRelatedIssue, removeRelatedIssue } from "./related-issue.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("POST .../revisions/:rev/issues.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await addRelatedIssue(context, {
      projectId: 1,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "should target the default repository path and send issue_id in the body",
    async () => {
      let capturedPathname: string | undefined;
      let capturedBody: unknown;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/projects/:id/repository/revisions/:rev/issues.json`,
          async ({ request }) => {
            capturedPathname = new URL(request.url).pathname;
            capturedBody = await request.json();
            return HttpResponse.json({});
          },
        ),
      );
      const e = await addRelatedIssue(context, {
        projectId: 1,
        rev: "abc123",
        issueId: 42,
      });
      expect(e.isOk()).toBe(true);
      expect(capturedPathname).toStrictEqual(
        "/projects/1/repository/revisions/abc123/issues.json",
      );
      expect(capturedBody).toStrictEqual({ issue_id: 42 });
    },
  );

  await t.step(
    "should include the repository id in the path when provided",
    async () => {
      let capturedPathname: string | undefined;
      server.resetHandlers(
        http.post(
          `${context.endpoint}/projects/:id/repository/:repositoryId/revisions/:rev/issues.json`,
          ({ request }) => {
            capturedPathname = new URL(request.url).pathname;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await addRelatedIssue(context, {
        projectId: 1,
        rev: "abc123",
        issueId: 42,
        repositoryId: "svn-repo",
      });
      expect(e.isOk()).toBe(true);
      expect(capturedPathname).toStrictEqual(
        "/projects/1/repository/svn-repo/revisions/abc123/issues.json",
      );
    },
  );

  await t.step("if got 422, should be err", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await addRelatedIssue(context, {
      projectId: 422,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isErr()).toBe(true);
  });

  await t.step("if got 404, should be err", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await addRelatedIssue(context, {
      projectId: 404,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isErr()).toBe(true);
  });
});

Deno.test("DELETE .../revisions/:rev/issues/:issue_id.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.resetHandlers(...validHandlers);
    const e = await removeRelatedIssue(context, {
      projectId: 1,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "should target the default repository path with the issue id",
    async () => {
      let capturedPathname: string | undefined;
      server.resetHandlers(
        http.delete(
          `${context.endpoint}/projects/:id/repository/revisions/:rev/issues/:issueId.json`,
          ({ request }) => {
            capturedPathname = new URL(request.url).pathname;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await removeRelatedIssue(context, {
        projectId: 1,
        rev: "abc123",
        issueId: 42,
      });
      expect(e.isOk()).toBe(true);
      expect(capturedPathname).toStrictEqual(
        "/projects/1/repository/revisions/abc123/issues/42.json",
      );
    },
  );

  await t.step(
    "should include the repository id in the path when provided",
    async () => {
      let capturedPathname: string | undefined;
      server.resetHandlers(
        http.delete(
          `${context.endpoint}/projects/:id/repository/:repositoryId/revisions/:rev/issues/:issueId.json`,
          ({ request }) => {
            capturedPathname = new URL(request.url).pathname;
            return HttpResponse.json({});
          },
        ),
      );
      const e = await removeRelatedIssue(context, {
        projectId: 1,
        rev: "abc123",
        issueId: 42,
        repositoryId: "svn-repo",
      });
      expect(e.isOk()).toBe(true);
      expect(capturedPathname).toStrictEqual(
        "/projects/1/repository/svn-repo/revisions/abc123/issues/42.json",
      );
    },
  );

  await t.step("if got 422, should be err", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await removeRelatedIssue(context, {
      projectId: 422,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isErr()).toBe(true);
  });

  await t.step("if got 404, should be err", async () => {
    server.resetHandlers(...invalidHandlers);
    const e = await removeRelatedIssue(context, {
      projectId: 404,
      rev: "abc123",
      issueId: 42,
    });
    expect(e.isErr()).toBe(true);
  });
});
