import { botLogger } from "./logger";

export interface Diagnostics {
  errorType: "PRISMA" | "TYPESCRIPT" | "NEXTJS_ROUTE" | "ENV" | "UNKNOWN";
  file?: string;
  errorMessage: string;
  suggestedPatch?: string;
}

export const BotAnalyzer = {
  analyzeLogs(logs: string): Diagnostics {
    botLogger.info("Analyzing build log dump...");

    if (logs.includes("Environment variable not found: DATABASE_URL") || logs.includes("PrismaClientInitializationError")) {
      return {
        errorType: "PRISMA",
        errorMessage: "Prisma client generate failed: Missing DATABASE_URL env parameter."
      };
    }

    if (logs.includes("export default") && logs.includes("api/")) {
      const match = logs.match(/src\/app\/api\/[^\s]*/);
      return {
        errorType: "NEXTJS_ROUTE",
        file: match ? match[0] : undefined,
        errorMessage: "Route Handler uses export default instead of named method exports."
      };
    }

    // Match TS compilation stack trace: e.g. path/file.ts(12,34): error TS1234: Message
    const tsMatch = logs.match(/([^\s]+.tsx?)\((\d+),(\d+)\): error TS\d+: (.*)/);
    if (tsMatch) {
      return {
        errorType: "TYPESCRIPT",
        file: tsMatch[1],
        errorMessage: tsMatch[4]
      };
    }

    return {
      errorType: "UNKNOWN",
      errorMessage: "Unclassified compile-time or dependency crash."
    };
  }
};
