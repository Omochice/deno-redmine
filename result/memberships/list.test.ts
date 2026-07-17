import { fetchList } from "./list.ts";
import { context, invalidHandlers, validHandlers } from "./_mock.ts";
import { http, HttpResponse } from "npm:msw@2.15.0";
import { setupServer } from "npm:msw@2.15.0/node";
import { expect } from "jsr:@std/expect@1.0.20";

const server = setupServer();
server.listen();

Deno.test("GET /projects/:project_id/memberships.json", async (t) => {
  await t.step("if got 200, should be success", async () => {
    server.use(...validHandlers);
    const e = await fetchList(context, 1);
    expect(e.isOk()).toBe(true);
  });

  await t.step(
    "if got 200, should return memberships with camelCase fields",
    async () => {
      server.use(...validHandlers);
      const e = await fetchList(context, 1);
      expect(e.isOk()).toBe(true);
      const memberships = e._unsafeUnwrap();
      expect(memberships[0].user).toStrictEqual({
        id: 17,
        name: "David Robert",
      });
      expect(memberships[0].roles).toStrictEqual([
        { id: 1, name: "Manager", inherited: true },
        { id: 2, name: "Developer" },
      ]);
      expect(memberships[1].group).toStrictEqual({ id: 8, name: "Developers" });
    },
  );

  await t.step(
    "if get invalid response with error object, should be err with error text",
    async () => {
      server.use(...invalidHandlers);
      const e = await fetchList(context, 422);
      expect(e.isErr()).toBe(true);
    },
  );

  await t.step("if get invalid response with unexpected format", async () => {
    server.use(...invalidHandlers);
    const e = await fetchList(context, 404);
    expect(e.isErr()).toBe(true);
  });

  await t.step(
    "should fetch every page when the listing is paginated",
    async () => {
      const total = 150;
      const all = Array.from({ length: total }, (_, i) => ({
        id: i + 1,
        project: { id: 1, name: "Demo" },
        user: { id: i + 1, name: `User ${i + 1}` },
        roles: [],
      }));
      server.use(
        http.get(
          `${context.endpoint}/projects/:id/memberships.json`,
          ({ request }) => {
            const params = new URL(request.url).searchParams;
            const offset = Number(params.get("offset"));
            const limit = Number(params.get("limit"));
            return HttpResponse.json({
              memberships: all.slice(offset, offset + limit),
              total_count: total,
            });
          },
        ),
      );
      const e = await fetchList(context, 1);
      expect(e.isOk()).toBe(true);
      const memberships = e._unsafeUnwrap();
      expect(memberships.length).toStrictEqual(total);
      expect(memberships[0].id).toStrictEqual(1);
      expect(memberships[total - 1].id).toStrictEqual(total);
    },
  );
});
