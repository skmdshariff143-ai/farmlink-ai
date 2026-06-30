import { botLogger } from "./logger";

export interface Diagnostics {
  file?: string;
  change: string;
  reason: string;
  riskLevel: "low" | "medium";
  errorType: "PRISMA" | "TYPESCRIPT" | "NEXTJS_ROUTE" | "ENV" | "UNKNOWN";
}

export const BotAnalyzer = {
  analyzeLogs(logs: string): Diagnostics {
    botLogger.info("Analyzing build log dump...");

    if (logs.includes("Environment variable not found: DATABASE_URL") || logs.includes("PrismaClientInitializationError")) {
      return {
        errorType: "PRISMA",
        change: "Inject mock DATABASE_URL fallback values during pipeline run",
        reason: "Prisma CLI requires a connection string pattern to compile client models.",
        riskLevel: "low"
      };
    }

    if (logs.includes("export default") && logs.includes("api/")) {
      const match = logs.match(/src\/app\/api\/[^\s]*/);
      const filePath = match ? match[0] : undefined;
      return {
        errorType: "NEXTJS_ROUTE",
        file: filePath,
        change: "Convert export default function GET to named export async function GET",
        reason: "Next.js 15 App Router Route Handlers mandate named verb exports instead of default exports.",
        riskLevel: "low"
      };
    }

    // Match TS compilation stack trace
    const tsMatch = logs.match(/([^\s]+.tsx?)\((\d+),(\d+)\): error TS\d+: (.*)/);
    if (tsMatch) {
      return {
        errorType: "TYPESCRIPT",
        file: tsMatch[1],
        change: "Expose missing interface parameters or override type definitions",
        reason: `TypeScript compiler failed with type error: ${tsMatch[4]}`,
        riskLevel: "medium" // Medium risk requires human review PR creation
      };
    }

    return {
      errorType: "UNKNOWN",
      change: "None",
      reason: "Unclassified logs crash.",
      riskLevel: "medium"
    };
  }
};
