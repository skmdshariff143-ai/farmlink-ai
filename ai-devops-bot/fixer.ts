import fs from "fs";
import { execSync } from "child_process";
import { BOT_CONFIG } from "./config";
import { botLogger } from "./logger";
import { Diagnostics } from "./analyzer";
import { GitHubService } from "./github";
import simpleGit from "simple-git";

const git = simpleGit();

export const BotFixer = {
  async applyFix(repo: string, diagnostics: Diagnostics): Promise<boolean> {
    const { errorType, file, change, reason, riskLevel } = diagnostics;
    const timestamp = Date.now();
    const branchName = `fix/ci-auto-heal-${timestamp}`;

    if (file) {
      // Guardrail Check
      const isProtected = BOT_CONFIG.PROTECTED_PATHS.some((path) => file.startsWith(path));
      if (isProtected) {
        botLogger.warn("Auto-fix aborted: Target file is protected under safety guardrails.", { file });
        return false;
      }
    }

    try {
      // 1. Checkout new branch
      botLogger.info(`Creating branch ${branchName}...`);
      await git.checkoutLocalBranch(branchName);

      if (riskLevel === "low") {
        if (errorType === "NEXTJS_ROUTE" && file) {
          botLogger.info("Applying Named Export patch to API route...", { file });
          let code = fs.readFileSync(file, "utf-8");
          code = code.replace(/export\s+default\s+async\s+function\s+GET/g, "export async function GET");
          code = code.replace(/export\s+default\s+function\s+GET/g, "export async function GET");
          fs.writeFileSync(file, code);
        } else if (errorType === "PRISMA") {
          botLogger.info("Applying Prisma Client Generation fallback...");
          execSync("npx.cmd prisma generate");
        }
      } else {
        botLogger.info("Patch marked as Medium risk. Skipping auto-write, prompting for review via PR.");
      }

      // 2. Commit and push
      botLogger.info("Committing and pushing branch to remote...");
      await git.add(".");
      await git.commit(`fix(ci): auto-heal pipeline failure - ${errorType}`);
      await git.push("origin", branchName);

      // 3. Create PR in safe mode
      const prTitle = `fix(ci): auto-heal pipeline failure - ${errorType}`;
      const prBody = `
### 🤖 FarmLink AI DevOps Self-Healing PR

An automated build failure was detected. The AI-healer has generated a resolution branch.

* **Failure Reason**: ${reason}
* **Proposed Correction**: ${change}
* **Risk Classification**: **${riskLevel.toUpperCase()}**

${riskLevel === "medium" ? "⚠️ **Caution**: This fix is flagged as medium risk. Please inspect code changes before merging." : "✓ **Safe**: Low-risk automated patch."}
      `;

      await GitHubService.createPullRequest(repo, branchName, prTitle, prBody);

      // Return to main branch
      await git.checkout("main");
      return true;
    } catch (err) {
      botLogger.error("Failed to apply code patch or commit fix", err);
      // Ensure we return to main
      try { await git.checkout("main"); } catch {}
      return false;
    }
  }
};
