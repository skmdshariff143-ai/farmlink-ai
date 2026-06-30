import { GitHubService } from "./github";
import { BotAnalyzer } from "./analyzer";
import { BotFixer } from "./fixer";
import { botLogger } from "./logger";

export async function runSelfHealingPipeline(repo: string, runId: string): Promise<void> {
  botLogger.info("Autonomous Healer Activated.", { repo, runId });

  // 1. Fetch raw logs
  const logs = await GitHubService.fetchFailureLogs(repo, runId);
  if (!logs) {
    botLogger.error("Healer aborted: Logs empty or unreachable.");
    return;
  }

  // 2. Analyze failure root cause
  const diagnostics = BotAnalyzer.analyzeLogs(logs);
  botLogger.info("Diagnostics concluded.", { diagnostics });

  if (diagnostics.errorType === "UNKNOWN") {
    botLogger.warn("Healer aborted: Root cause is unclassified.");
    return;
  }

  // 3. Auto-fix and commit patch
  const fixed = await BotFixer.applyFix(diagnostics);
  if (fixed) {
    botLogger.info("Auto-patch pushed successfully. Restarting CI pipeline...");
    // 4. Trigger GitHub Action rerun
    await GitHubService.triggerRerun(repo, runId);
  } else {
    botLogger.warn("Healer aborted: Code fix could not be safely applied.");
  }
}
