import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.join(__dirname, "../prisma/schema.prisma");
const SRC_DIR = path.join(__dirname, "../src");

function parseSchemaModels() {
  const schemaContent = fs.readFileSync(SCHEMA_PATH, "utf8");
  const modelRegex = /model\s+([A-Za-z0-9_]+)\s*\{/g;
  const models = new Set();
  let match;
  while ((match = modelRegex.exec(schemaContent)) !== null) {
    models.add(match[1].toLowerCase());
  }
  return { models, schemaContent };
}

function scanCodebaseForModels() {
  const modelsInCode = new Set();
  const fileRegex = /\.(ts|tsx|js|jsx)$/;

  function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        if (file !== "node_modules" && file !== ".next" && file !== "mobile-app") {
          walk(fullPath);
        }
      } else if (fileRegex.test(file)) {
        const content = fs.readFileSync(fullPath, "utf8");
        const prismaQueryRegex = /prisma\.([a-z][A-Za-z0-9_]*)\./g;
        let match;
        while ((match = prismaQueryRegex.exec(content)) !== null) {
          const modelName = match[1];
          // Exclude internal Prisma methods
          if (!modelName.startsWith("$")) {
            modelsInCode.add(modelName);
          }
        }
      }
    }
  }

  if (fs.existsSync(SRC_DIR)) {
    walk(SRC_DIR);
  }
  return modelsInCode;
}

function generateMockModel(name) {
  const upperName = name.charAt(0).toUpperCase() + name.slice(1);
  console.log(`🤖 Auto-Mocking: Generating model definition for "${upperName}"...`);
  
  if (name.toLowerCase() === "payment") {
    return `
model ${upperName} {
  id        String   @id @default(uuid())
  orderId   String
  amount    Float
  method    String   @default("mock")
  status    String   @default("Pending")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
  }
  
  if (name.toLowerCase() === "order") {
    return `
model ${upperName} {
  id            String   @id @default(uuid())
  buyerId       String
  total         Float
  status        String   @default("PENDING")
  paymentMethod String   @default("mock")
  paymentStatus String   @default("Pending")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
`;
  }

  return `
model ${upperName} {
  id        String   @id @default(uuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
`;
}

function main() {
  const { models: existingModels, schemaContent } = parseSchemaModels();
  const modelsInCode = scanCodebaseForModels();

  let schemaUpdated = false;
  let appendedContent = "";

  for (const modelName of modelsInCode) {
    if (!existingModels.has(modelName.toLowerCase())) {
      console.warn(`⚠️ Warning: Model "${modelName}" found in code is missing from schema.prisma.`);
      appendedContent += generateMockModel(modelName);
      schemaUpdated = true;
    }
  }

  if (schemaUpdated) {
    // Backup schema
    fs.writeFileSync(`${SCHEMA_PATH}.bak`, schemaContent);
    // Append mock models
    fs.appendFileSync(SCHEMA_PATH, appendedContent);
    console.log("✓ Success: schema.prisma patched with mock model schemas.");
  } else {
    console.log("✓ Success: Schema is fully synced with code references. No mock generation needed.");
  }
}

main();
