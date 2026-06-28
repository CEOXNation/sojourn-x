import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const realmsFile = path.join(repoRoot, "src", "data", "realms.ts");

const requiredRealmKeys = [
  "anonymous",
  "social",
  "messaging",
  "marketplace",
  "spiritual",
  "growth"
];

function fail(message) {
  console.error(`\n[realm-audit] FAIL: ${message}`);
  process.exit(1);
}

if (!fs.existsSync(realmsFile)) {
  fail("Missing src/data/realms.ts");
}

const source = fs.readFileSync(realmsFile, "utf8");

const blockMatch = source.match(/export const realms:\s*Realm\[\]\s*=\s*\[(.*?)\];/s);
if (!blockMatch) {
  fail("Could not parse realms array.");
}

const block = blockMatch[1];
const realmChunks = block
  .split(/\n\s*\},\n\s*\{/g)
  .map((chunk, index, arr) => {
    if (index === 0) return `${chunk}\n  }`;
    if (index === arr.length - 1) return `  {\n${chunk}`;
    return `  {\n${chunk}\n  }`;
  });

const parsed = realmChunks
  .map((chunk) => {
    const keyMatch = chunk.match(/key:\s*"([a-z]+)"/);
    const titleMatch = chunk.match(/title:\s*"([^"]+)"/);
    const featureBlockMatch = chunk.match(/features:\s*\[(.*?)\]/s);

    if (!keyMatch || !titleMatch || !featureBlockMatch) {
      return null;
    }

    const features = [...featureBlockMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);

    return {
      key: keyMatch[1],
      title: titleMatch[1],
      featureCount: features.length
    };
  })
  .filter(Boolean);

if (parsed.length !== requiredRealmKeys.length) {
  fail(`Expected ${requiredRealmKeys.length} realms, found ${parsed.length}.`);
}

const foundKeys = parsed.map((realm) => realm.key);
const missing = requiredRealmKeys.filter((key) => !foundKeys.includes(key));
const unexpected = foundKeys.filter((key) => !requiredRealmKeys.includes(key));

if (missing.length > 0) {
  fail(`Missing required realm keys: ${missing.join(", ")}`);
}

if (unexpected.length > 0) {
  fail(`Unexpected realm keys found: ${unexpected.join(", ")}`);
}

const underFeatured = parsed.filter((realm) => realm.featureCount < 3);
if (underFeatured.length > 0) {
  fail(
    `Realms with too few features: ${underFeatured
      .map((realm) => `${realm.key} (${realm.featureCount})`)
      .join(", ")}`
  );
}

console.log("\n[realm-audit] PASS: Realm integrity verified.");
console.log("[realm-audit] Summary:");
for (const realm of parsed) {
  console.log(`- ${realm.key.padEnd(12)} | ${String(realm.featureCount).padStart(2)} features | ${realm.title}`);
}
