const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Starting pre-commit secret scan...");

const patterns = [
  /AIza[0-9a-zA-Z\-_]{35}/, // Google API Key
  /sk_live_[0-9a-zA-Z]{24}/, // Stripe Live Key
  /sk_test_[0-9a-zA-Z]{24}/, // Stripe Test Key
  /rzp_live_[0-9a-zA-Z]{14}/, // Razorpay Live Key
  /postgresql:\/\/[^'\"\s]+/ // Postgres connection string
];

// Get list of staged files
const stagedFilesOutput = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" });
const stagedFiles = stagedFilesOutput.split("\n").map(f => f.trim()).filter(Boolean);

let foundSecret = false;

stagedFiles.forEach(file => {
  // Skip environment examples, seeds, and test files
  const filename = path.basename(file);
  if (
    filename === ".env.example" || 
    filename === "seed.ts" || 
    filename.endsWith(".test.ts") || 
    filename.endsWith(".test.js")
  ) {
    return;
  }

  if (!fs.existsSync(file)) return;
  const stat = fs.statSync(file);
  if (stat.isDirectory()) return;

  const content = fs.readFileSync(file, "utf8");
  const lines = content.split("\n");

  lines.forEach((line, idx) => {
    patterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match) {
        // Exclude mock templates (e.g. your-key, mock_secret, etc.)
        const matchStr = match[0].toLowerCase();
        if (
          matchStr.includes("your") || 
          matchStr.includes("mock") || 
          matchStr.includes("placeholder") || 
          matchStr.includes("example") ||
          matchStr.includes("<password>") ||
          matchStr.includes("postgres_password")
        ) {
          return;
        }

        console.error(`\x1b[31m[ERROR] Potential secret leaked in staged file: ${file}:${idx + 1}\x1b[0m`);
        console.error(`\x1b[31mMatch: ${match[0].substring(0, 8)}...\x1b[0m`);
        foundSecret = true;
      }
    });
  });
});

if (foundSecret) {
  console.error("\x1b[31m[FATAL] Commit blocked due to potential secrets. Please remove secrets before committing.\x1b[0m");
  process.exit(1);
} else {
  console.log("✓ Pre-commit secret scan passed cleanly.");
}
