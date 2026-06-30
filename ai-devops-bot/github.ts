import { Octokit } from "@octokit/rest";
import { BOT_CONFIG } from "./config";
import { botLogger } from "./logger";

const octokit = new Octokit({ auth: BOT_CONFIG.GITHUB_TOKEN });

export const GitHubService = {
  async fetchFailureLogs(repo: string, runId: string): Promise<string> {
    botLogger.info("Fetching workflow logs from GitHub...", { repo, runId });
    try {
      const [owner, name] = repo.split("/");
      const response = await octokit.actions.downloadWorkflowRunAttemptLogs({
        owner,
        repo: name,
        run_id: Number(runId),
        attempt_number: 1
      });
      return response.data as unknown as string;
    } catch (err) {
      botLogger.error("Failed to fetch logs using Octokit", err);
      return "";
    }
  },

  async createPullRequest(
    repo: string,
    branchName: string,
    title: string,
    body: string
  ): Promise<boolean> {
    botLogger.info("Opening a Pull Request in Safe Mode...", { branchName });
    try {
      const [owner, name] = repo.split("/");
      const response = await octokit.pulls.create({
        owner,
        repo: name,
        title,
        head: branchName,
        base: "main",
        body
      });
      botLogger.info("Pull Request opened successfully!", { prUrl: response.data.html_url });
      return true;
    } catch (err) {
      botLogger.error("Failed to create Pull Request", err);
      return false;
    }
  },

  async triggerRerun(repo: string, runId: string): Promise<boolean> {
    botLogger.info("Triggering workflow re-run...", { repo, runId });
    try {
      const [owner, name] = repo.split("/");
      await octokit.actions.reRunWorkflowFailedJobs({
        owner,
        repo: name,
        run_id: Number(runId)
      });
      return true;
    } catch (err) {
      botLogger.error("Failed to trigger failure re-runs", err);
      return false;
    }
  }
};
