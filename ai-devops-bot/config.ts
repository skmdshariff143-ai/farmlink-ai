export const BOT_CONFIG = {
  GITHUB_TOKEN: process.env.GITHUB_TOKEN || "",
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "",
  MAX_RETRIES: 3,
  PROTECTED_PATHS: [
    "src/app/api/payments",
    "src/lib/auth.ts",
    ".github/workflows/ci.yml"
  ],
  MOCK_DB_URL: "postgresql://postgres:postgres@localhost:5432/postgres"
};
