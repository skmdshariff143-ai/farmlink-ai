import { BOT_CONFIG } from "./config";
import { botLogger } from "./logger";

export const GitHubService = {
  async fetchFailureLogs(repo: string, runId: string): Promise<string> {
    botLogger.info("Fetching workflow logs from GitHub...", { repo, runId });
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${runId}/logs`, {
        headers: {
          Authorization: `Bearer ${BOT_CONFIG.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      return await response.text();
    } catch (err) {
      botLogger.error("Failed to fetch GitHub Action logs", err);
      return "";
    }
  },

  async triggerRerun(repo: string, runId: string): Promise<boolean> {
    botLogger.info("Triggering workflow re-run...", { repo, runId });
    try {
      const response = await fetch(`https://api.github.com/repos/${repo}/actions/runs/${runId}/rerun`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${BOT_CONFIG.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json"
        }
      });
      return response.ok;
    } catch (err) {
      botLogger.error("Failed to trigger re-run", err);
      return false;
    }
  }
};
