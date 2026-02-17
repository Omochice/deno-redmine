import type { Context } from "../context.ts";

const REDMINE_CONTAINER_NAME = Deno.env.get("REDMINE_CONTAINER_NAME") ??
  "e2e-redmine-1";
const TOKEN_OUTPUT_PREFIX = "E2E_API_KEY:";

async function waitForRedmine(
  url: string,
  { maxRetries = 30, intervalMs = 5000 }: {
    maxRetries?: number;
    intervalMs?: number;
  } = {},
): Promise<void> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await response.body?.cancel();
        return;
      }
      await response.body?.cancel();
    } catch {
      // Connection errors are expected while Redmine is still booting
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Redmine did not become ready at ${url}`);
}

async function runRailsRunner(script: string): Promise<string> {
  const command = new Deno.Command("docker", {
    args: [
      "exec",
      REDMINE_CONTAINER_NAME,
      "bash",
      "-c",
      `cd /usr/src/redmine && SECRET_KEY_BASE=e2e-test-secret-key-base RAILS_ENV=production bundle exec rails runner '${script}'`,
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const { code, stdout, stderr } = await command.output();
  if (code !== 0) {
    throw new Error(
      `rails runner failed: ${new TextDecoder().decode(stderr)}`,
    );
  }
  return new TextDecoder().decode(stdout);
}

async function setupRedmine(): Promise<string> {
  // Single rails runner call that:
  // 1. Enables REST API
  // 2. Creates default tracker, status, and priority if missing
  // 3. Creates API token for admin
  // 4. Outputs the token with a prefix marker to distinguish from Rails logs
  const script = [
    'Setting.where(name: "rest_api_enabled").first_or_initialize.tap { |s| s.value = "1"; s.save! }',
    'Tracker.create!(name: "Bug", default_status: IssueStatus.first || IssueStatus.create!(name: "New")) if Tracker.count == 0',
    'IssueStatus.create!(name: "New") if IssueStatus.count == 0',
    'IssuePriority.create!(name: "Normal") if IssuePriority.count == 0',
    'user = User.find_by!(login: "admin")',
    'Token.where(user: user, action: "api").destroy_all',
    'token = Token.create!(user: user, action: "api")',
    `$stdout.write("${TOKEN_OUTPUT_PREFIX}#{token.value}")`,
  ].join("; ");

  const output = await runRailsRunner(script);

  // Extract token value from output using the prefix marker
  // Rails may emit log lines to stdout, so we search for our marker
  const match = output.match(new RegExp(`${TOKEN_OUTPUT_PREFIX}(\\S+)`));
  if (!match) {
    throw new Error(
      `Could not find API key in rails runner output: ${output}`,
    );
  }
  return match[1];
}

async function seedTestData(context: Context): Promise<void> {
  const headers = {
    "Content-Type": "application/json",
    "X-Redmine-API-Key": context.apiKey,
  };

  const projectResponse = await fetch(
    `${context.endpoint}/projects.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        project: {
          name: "E2E Test Project",
          identifier: "e2e-test-project",
          is_public: true,
          enabled_module_names: [
            "issue_tracking",
            "wiki",
          ],
        },
      }),
    },
  );
  if (!projectResponse.ok) {
    const body = await projectResponse.text();
    throw new Error(
      `Failed to create test project (${projectResponse.status}): ${body}`,
    );
  }

  const projectData = await projectResponse.json();
  const projectId: number = projectData.project.id;

  const trackersResponse = await fetch(
    `${context.endpoint}/trackers.json`,
    { headers },
  );
  if (!trackersResponse.ok) {
    throw new Error(`Failed to fetch trackers (${trackersResponse.status})`);
  }
  const trackersData = await trackersResponse.json();
  const trackerId: number = trackersData.trackers[0].id;

  const statusesResponse = await fetch(
    `${context.endpoint}/issue_statuses.json`,
    { headers },
  );
  if (!statusesResponse.ok) {
    throw new Error(`Failed to fetch statuses (${statusesResponse.status})`);
  }
  const statusesData = await statusesResponse.json();
  const statusId: number = statusesData.issue_statuses[0].id;

  const prioritiesResponse = await fetch(
    `${context.endpoint}/enumerations/issue_priorities.json`,
    { headers },
  );
  if (!prioritiesResponse.ok) {
    throw new Error(
      `Failed to fetch priorities (${prioritiesResponse.status})`,
    );
  }
  const prioritiesData = await prioritiesResponse.json();
  const priorityId: number = prioritiesData.issue_priorities[0].id;

  const issueResponse = await fetch(
    `${context.endpoint}/issues.json`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        issue: {
          project_id: projectId,
          tracker_id: trackerId,
          status_id: statusId,
          priority_id: priorityId,
          subject: "E2E Test Issue",
          description: "This issue was created by the E2E test setup script.",
        },
      }),
    },
  );
  if (!issueResponse.ok) {
    const body = await issueResponse.text();
    throw new Error(
      `Failed to create test issue (${issueResponse.status}): ${body}`,
    );
  }

  const wikiResponse = await fetch(
    `${context.endpoint}/projects/${projectId}/wiki/E2ETestPage.json`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify({
        wiki_page: {
          text: "This is the E2E test wiki page content.",
        },
      }),
    },
  );
  if (!wikiResponse.ok) {
    const body = await wikiResponse.text();
    throw new Error(
      `Failed to create test wiki page (${wikiResponse.status}): ${body}`,
    );
  }
}

if (import.meta.main) {
  const endpoint = Deno.env.get("REDMINE_URL") ?? "http://localhost:3000";

  console.log("Waiting for Redmine to be ready...");
  await waitForRedmine(endpoint);
  console.log("Redmine is ready.");

  console.log("Setting up Redmine (REST API, defaults, API token)...");
  const apiKey = await setupRedmine();
  console.log("Redmine setup complete.");

  const context = { endpoint, apiKey };

  console.log("Seeding test data...");
  await seedTestData(context);
  console.log("Test data seeded.");

  // Output the generated API key so CI can capture it
  console.log(`REDMINE_API_KEY=${apiKey}`);
}
