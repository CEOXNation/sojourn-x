import fs from "node:fs";
import path from "node:path";

const strictMode = process.argv.includes("--strict");
const repoRoot = process.cwd();

const requiredFiles = [
  "README.md",
  "App.tsx",
  "app.json",
  "src/data/realms.ts",
  "src/theme.ts",
  "src/types.ts",
  "docs/legal/TERMS.md",
  "docs/legal/PRIVACY.md",
  "docs/legal/COMMUNITY.md",
  "docs/security/THREAT_MODEL.md"
];

const claimPatterns = [
  /end-to-end encrypted/i,
  /\bencrypted\b/i,
  /\banonymous\b/i,
  /secure marketplace/i,
  /private by design/i
];

const requiredDisclaimers = [
  /prototype/i,
  /must include real backend|must be implemented before launch|legal review/i
];

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function reportAndExit(failures, warnings) {
  if (warnings.length > 0) {
    console.log("\n[release-check] Warnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (failures.length > 0) {
    console.error("\n[release-check] FAIL:");
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log("\n[release-check] PASS: Release readiness checks passed.");
}

const failures = [];
const warnings = [];

for (const file of requiredFiles) {
  if (!exists(file)) {
    const message = `Missing required file: ${file}`;
    if (strictMode) {
      failures.push(message);
    } else {
      warnings.push(message);
    }
  }
}

const docsToScan = ["README.md", "App.tsx"];
let fullText = "";
for (const file of docsToScan) {
  if (exists(file)) {
    fullText += `\n${read(file)}`;
  }
}

const hasClaim = claimPatterns.some((pattern) => pattern.test(fullText));
const hasDisclaimerCoverage = requiredDisclaimers.every((pattern) => pattern.test(fullText));

if (hasClaim && !hasDisclaimerCoverage) {
  const message = "Privacy/security claims detected without sufficient prototype/legal disclaimer coverage.";
  if (strictMode) {
    failures.push(message);
  } else {
    warnings.push(message);
  }
}

const bannedLaunchClaimPattern = /guaranteed anonymity|unbreakable encryption|perfectly secure/i;
if (bannedLaunchClaimPattern.test(fullText)) {
  failures.push("Detected absolute security claims that should not be used in product messaging.");
}

reportAndExit(failures, warnings);
