import type { Context } from "../context.ts";

function getRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (value === undefined) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

export const e2eContext: Context = {
  endpoint: Deno.env.get("REDMINE_URL") ?? "http://localhost:3000",
  apiKey: getRequiredEnv("REDMINE_API_KEY"),
};
