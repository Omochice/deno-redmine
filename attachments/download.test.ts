import { download } from "./download.ts";
import {
  attachmentContent,
  contentHandlers,
  contentPath,
  context,
  showHandler,
  validHandlers,
} from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { STATUS_CODE } from "jsr:@std/http@1.1.3/status";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

const storageEndpoint = "http://storage.example.net";

Deno.test("GET the attachment content", async (t) => {
  await t.step(
    "if got 200, should return the metadata and the content",
    async () => {
      server.use(...validHandlers, ...contentHandlers);
      const downloaded = await download(context, 6243);
      expect(downloaded.filename).toStrictEqual("example.txt");
      expect(downloaded.contentType).toStrictEqual("text/plain");
      expect(downloaded.filesize).toStrictEqual(124);
      expect(await new Response(downloaded.body).text()).toStrictEqual(
        attachmentContent,
      );
    },
  );

  await t.step(
    "if content_url names another host, should request the endpoint instead",
    async () => {
      let requested = false;
      server.use(
        showHandler({
          content_url: `http://internal.invalid${contentPath}`,
        }),
        http.get(`${context.endpoint}${contentPath}`, () => {
          requested = true;
          return HttpResponse.text(attachmentContent);
        }),
      );
      const downloaded = await download(context, 6243);
      expect(await new Response(downloaded.body).text()).toStrictEqual(
        attachmentContent,
      );
      expect(requested).toStrictEqual(true);
    },
  );

  await t.step("if got a non-ok content response, should throw", async () => {
    server.use(
      ...validHandlers,
      http.get(`${context.endpoint}${contentPath}`, () => {
        return new HttpResponse(null, { status: STATUS_CODE.NotFound });
      }),
    );
    await expect(download(context, 6243)).rejects.toThrow();
  });

  await t.step(
    "if redirected to the same origin, should keep sending the api key",
    async () => {
      let apiKey: string | null = null;
      server.use(
        ...validHandlers,
        http.get(`${context.endpoint}${contentPath}`, () => {
          return HttpResponse.redirect(
            `${context.endpoint}/attachments/download/6243/moved.txt`,
            STATUS_CODE.Found,
          );
        }),
        http.get(
          `${context.endpoint}/attachments/download/6243/moved.txt`,
          ({ request }) => {
            apiKey = request.headers.get("X-Redmine-API-Key");
            return HttpResponse.text(attachmentContent);
          },
        ),
      );

      const downloaded = await download(context, 6243);
      expect(await new Response(downloaded.body).text()).toStrictEqual(
        attachmentContent,
      );
      expect(apiKey).toStrictEqual(context.apiKey);
    },
  );

  await t.step(
    "if redirected to another origin, should not send the api key there",
    async () => {
      let apiKey: string | null = "not requested";
      server.use(
        ...validHandlers,
        http.get(`${context.endpoint}${contentPath}`, () => {
          return HttpResponse.redirect(
            `${storageEndpoint}/presigned/example.txt`,
            STATUS_CODE.Found,
          );
        }),
        http.get(`${storageEndpoint}/presigned/example.txt`, ({ request }) => {
          apiKey = request.headers.get("X-Redmine-API-Key");
          return HttpResponse.text(attachmentContent);
        }),
      );

      const downloaded = await download(context, 6243);
      expect(await new Response(downloaded.body).text()).toStrictEqual(
        attachmentContent,
      );
      expect(apiKey).toStrictEqual(null);
    },
  );

  await t.step(
    "if redirected to a relative location, should resolve it against the requested url",
    async () => {
      server.use(
        ...validHandlers,
        http.get(`${context.endpoint}${contentPath}`, () => {
          return new HttpResponse(null, {
            status: STATUS_CODE.Found,
            headers: { Location: "moved.txt" },
          });
        }),
        http.get(
          `${context.endpoint}/attachments/download/6243/moved.txt`,
          () => {
            return HttpResponse.text(attachmentContent);
          },
        ),
      );

      const downloaded = await download(context, 6243);
      expect(await new Response(downloaded.body).text()).toStrictEqual(
        attachmentContent,
      );
    },
  );

  await t.step("if redirected more than 20 times, should throw", async () => {
    server.use(
      ...validHandlers,
      http.get(`${context.endpoint}${contentPath}`, () => {
        return HttpResponse.redirect(
          `${context.endpoint}${contentPath}`,
          STATUS_CODE.Found,
        );
      }),
    );

    await expect(download(context, 6243)).rejects.toThrow();
  });

  await t.step("if redirected exactly 20 times, should resolve", async () => {
    let hops = 0;
    server.use(
      ...validHandlers,
      http.get(`${context.endpoint}${contentPath}`, () => {
        hops += 1;
        if (hops <= 20) {
          return HttpResponse.redirect(
            `${context.endpoint}${contentPath}`,
            STATUS_CODE.Found,
          );
        }
        return HttpResponse.text(attachmentContent);
      }),
    );

    const downloaded = await download(context, 6243);
    expect(await new Response(downloaded.body).text()).toStrictEqual(
      attachmentContent,
    );
  });
});
