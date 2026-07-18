import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import { show } from "../result/attachments/show.ts";
import { update } from "../result/attachments/update.ts";
import { deleteAttachment } from "../result/attachments/delete.ts";

const headers = {
  "Content-Type": "application/json",
  "X-Redmine-API-Key": e2eContext.apiKey,
};

async function findSeededIssueId(): Promise<number | undefined> {
  const response = await fetch(`${e2eContext.endpoint}/issues.json`, {
    headers,
  });
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const data = await response.json();
  const issue = data.issues.find((i: { subject: string }) =>
    i.subject === "E2E Test Issue"
  );
  return issue?.id;
}

// Attachments cannot be created directly: a file must first be uploaded to
// obtain a token, then linked to an issue. Both steps use raw endpoints the
// library does not expose, so they are performed with fetch here.
async function uploadToken(): Promise<string | undefined> {
  const response = await fetch(`${e2eContext.endpoint}/uploads.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "X-Redmine-API-Key": e2eContext.apiKey,
    },
    body: new TextEncoder().encode("E2E attachment content"),
  });
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const data = await response.json();
  return data.upload?.token;
}

async function attachToIssue(issueId: number, token: string): Promise<boolean> {
  const response = await fetch(
    `${e2eContext.endpoint}/issues/${issueId}.json`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        issue: {
          uploads: [
            {
              token,
              filename: "e2e-attachment.txt",
              content_type: "text/plain",
            },
          ],
        },
      }),
    },
  );
  const ok = response.ok;
  await response.body?.cancel();
  return ok;
}

async function findAttachmentId(issueId: number): Promise<number | undefined> {
  const response = await fetch(
    `${e2eContext.endpoint}/issues/${issueId}.json?include=attachments`,
    { headers },
  );
  if (!response.ok) {
    await response.body?.cancel();
    return undefined;
  }
  const data = await response.json();
  const attachment = data.issue?.attachments?.find((
    a: { filename: string },
  ) => a.filename === "e2e-attachment.txt");
  return attachment?.id;
}

Deno.test({
  name: "E2E: Attachments API",
  fn: async (t) => {
    const issueId = await findSeededIssueId();
    if (issueId === undefined) {
      console.warn("Skipping: seeded issue not found");
      return;
    }

    const token = await uploadToken();
    if (token === undefined) {
      console.warn("Skipping: file upload is restricted on this Redmine");
      return;
    }

    const attached = await attachToIssue(issueId, token);
    if (!attached) {
      console.warn("Skipping: could not attach upload to issue");
      return;
    }

    const attachmentId = await findAttachmentId(issueId);
    if (attachmentId === undefined) {
      console.warn("Skipping: attachment not found on issue");
      return;
    }

    await t.step(
      "GET /attachments/:id.json should return an attachment",
      async () => {
        const result = await show(e2eContext, attachmentId);
        expect(result.isOk()).toBe(true);
        const attachment = result._unsafeUnwrap();
        expect(attachment.id).toStrictEqual(attachmentId);
        expect(attachment.filename).toStrictEqual(
          "e2e-attachment.txt",
        );
        expect(attachment.contentType).toStrictEqual("text/plain");
        expect(attachment.author).toBeDefined();
      },
    );

    await t.step(
      "PATCH /attachments/:id.json should update an attachment",
      async () => {
        const result = await update(e2eContext, attachmentId, {
          description: "Updated by E2E test",
        });
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, attachmentId);
        expect(showResult.isOk()).toBe(true);
        expect(showResult._unsafeUnwrap().description).toStrictEqual(
          "Updated by E2E test",
        );
      },
    );

    await t.step(
      "DELETE /attachments/:id.json should delete an attachment",
      async () => {
        const result = await deleteAttachment(e2eContext, attachmentId);
        expect(result.isOk()).toBe(true);

        const showResult = await show(e2eContext, attachmentId);
        expect(showResult.isErr()).toBe(true);
      },
    );
  },
});
