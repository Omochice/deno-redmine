import { parse } from "jsr:@valibot/valibot@1.4.2";
import { buildUrl } from "../../internal/url.ts";
import { type Enumeration } from "./type.ts";
import type { Context } from "../../context.ts";
import { assertResponse } from "../../error.ts";
import {
  listDocumentCategoryResponse,
  listIssuePriorityResponse,
  listTimeEntryActivityResponse,
} from "./validator.ts";

// The three enumeration endpoints only differ in path segment and response
// wrapper key; the request/response-status handling is shared here so each
// exported function only has to describe its own segment and schema.
async function fetchEnumerations(
  context: Context,
  segment: string,
): Promise<unknown> {
  const endpoint = buildUrl(context.endpoint, "enumerations", segment);
  const response = await fetch(
    endpoint,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Redmine-API-Key": context.apiKey,
      },
    },
  );
  assertResponse(response);
  return await response.json();
}

/**
 * Fetch issue priorities
 *
 * @param context REST endpoint context
 * @return Array of Enumeration
 */
export async function listIssuePriorities(
  context: Context,
): Promise<Enumeration[]> {
  const body = await fetchEnumerations(context, "issue_priorities.json");
  return parse(listIssuePriorityResponse, body).issue_priorities;
}

/**
 * Fetch time entry activities
 *
 * @param context REST endpoint context
 * @return Array of Enumeration
 */
export async function listTimeEntryActivities(
  context: Context,
): Promise<Enumeration[]> {
  const body = await fetchEnumerations(context, "time_entry_activities.json");
  return parse(listTimeEntryActivityResponse, body).time_entry_activities;
}

/**
 * Fetch document categories
 *
 * @param context REST endpoint context
 * @return Array of Enumeration
 */
export async function listDocumentCategories(
  context: Context,
): Promise<Enumeration[]> {
  const body = await fetchEnumerations(context, "document_categories.json");
  return parse(listDocumentCategoryResponse, body).document_categories;
}
