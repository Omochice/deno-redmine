import { expect } from "jsr:@std/expect@1.0.20";
import { e2eContext } from "./context.ts";
import {
  listDocumentCategories,
  listIssuePriorities,
  listTimeEntryActivities,
} from "../enumerations/list.ts";

Deno.test("E2E: Enumerations API", async (t) => {
  // The e2e Redmine is provisioned without loading Redmine's default data, so
  // these enumeration listings can be empty; a successful parse already
  // proves the response matches the schema regardless of length.
  await t.step(
    "GET /enumerations/issue_priorities.json should return an array",
    async () => {
      const priorities = await listIssuePriorities(e2eContext);
      expect(Array.isArray(priorities)).toBe(true);
    },
  );

  await t.step(
    "GET /enumerations/time_entry_activities.json should return an array",
    async () => {
      const activities = await listTimeEntryActivities(e2eContext);
      expect(Array.isArray(activities)).toBe(true);
    },
  );

  await t.step(
    "GET /enumerations/document_categories.json should return an array",
    async () => {
      const categories = await listDocumentCategories(e2eContext);
      expect(Array.isArray(categories)).toBe(true);
    },
  );
});
