import fs from "fs";
import { execSync } from "child_process";
import { BOT_CONFIG } from "./config";
import { botLogger } from "./logger";
import { Diagnostics } from "./analyzer";
import simpleGit from "simple-git";

const git = simpleGit();

export const BotFixer = {
  async applyFix(diagnostics: Diagnostics): Promise<boolean> {
    const { errorType, file } = diagnostics;

    if (file) {
      // Guardrail Check
      const isProtected = BOT_CONFIG.PROTECTED_PATHS.some((path) => file.startsWith(path));
      if (isProtected) {
        botLogger.warn("Auto-fix aborted: Target file is protected under safety guardrails.", { file });
        return false;
      }
    }

    try {
      if (errorType === "NEXTJS_ROUTE" && file) {
        botLogger.info("Applying Named Export patch to API route...", { file });
        let code = fs.readFileSync(file, "utf-8");
        code = code.replace(/export\s+default\s+async\s+function\s+GET/g, "export async function GET");
        code = code.replace(/export\s+default\s+function\s+GET/g, "export async function GET");
        fs.writeFileSync(file, code);
      } else if (errorType === "PRISMA") {
        botLogger.info("Applying Prisma Client Generation fallback...");
        execSync("npx.cmd prisma generate");
      } else {
        botLogger.warn("Auto-fix could not map a safe correction template.");
        return false;
      }

      // Local Sanity Test
      botLogger.info("Running local verification compiler compile test...");
      execSync("npx.cmd tsc --noEmit", { stdio: "inherit" });

      // Commit changes
      botLogger.info("Staging and committing auto-heal changes...");
      await git.add(".");
      await git.commit("fix(ci): auto-heal pipeline error");
      await git.push("origin", "main");

      return true;
    } catch (err) {
      botLogger.error("Failed to apply code patch or commit fix", err);
      return false;
    }
  }
};
