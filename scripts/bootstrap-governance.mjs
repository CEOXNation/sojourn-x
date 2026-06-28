import fs from "node:fs";
import path from "node:path";

const force = process.argv.includes("--force");
const repoRoot = process.cwd();

const files = [
  {
    file: "docs/legal/TERMS.md",
    content: `# Terms of Service (Draft)\n\nThis draft is a placeholder for legal counsel review.\n\n## Required Sections\n\n- Eligibility and age requirements (18+)\n- User responsibilities and prohibited conduct\n- Account enforcement and termination\n- Marketplace terms and seller obligations\n- Content ownership and license\n- Dispute resolution and jurisdiction\n- Limitation of liability\n\n## Current Status\n\nNot legally approved. Do not treat as production terms.\n`
  },
  {
    file: "docs/legal/PRIVACY.md",
    content: `# Privacy Policy (Draft)\n\nThis draft is a placeholder for legal counsel review.\n\n## Required Sections\n\n- Data categories collected\n- Purpose and lawful basis for processing\n- Retention periods and deletion controls\n- Data sharing and processors\n- User rights and contact channels\n- Security safeguards\n- International transfer disclosures\n\n## Current Status\n\nNot legally approved. Do not treat as production privacy policy.\n`
  },
  {
    file: "docs/legal/COMMUNITY.md",
    content: `# Community Guidelines (Draft)\n\nSojournX is designed as a respectful, adults-only platform.\n\n## Guardrails\n\n- No harassment, threats, or hate content\n- No exploitation, trafficking, or illegal commerce\n- No doxxing or privacy violations\n- No self-harm encouragement\n- Respect anonymous and private boundaries\n\n## Enforcement\n\nReports should flow through moderation tooling with escalation paths and audit logs.\n`
  },
  {
    file: "docs/security/THREAT_MODEL.md",
    content: `# Threat Model (Draft)\n\nThis document is a starter checklist for production security design.\n\n## Assets\n\n- User identity metadata\n- Private messages and media\n- Marketplace transaction data\n- Moderation and audit logs\n\n## Baseline Controls\n\n- Authentication hardening (MFA optionality, session controls)\n- Transport security and key management plan\n- Abuse prevention and anomaly detection\n- Data retention and deletion workflows\n- Incident response runbook\n\n## Current Status\n\nNot security-reviewed. Do not claim cryptographic guarantees until implemented and audited.\n`
  }
];

function ensureDir(targetFile) {
  const dir = path.dirname(path.join(repoRoot, targetFile));
  fs.mkdirSync(dir, { recursive: true });
}

let created = 0;
let skipped = 0;
let overwritten = 0;

for (const entry of files) {
  const target = path.join(repoRoot, entry.file);
  ensureDir(entry.file);
  const existedBefore = fs.existsSync(target);

  if (existedBefore && !force) {
    skipped += 1;
    continue;
  }

  fs.writeFileSync(target, entry.content, "utf8");
  if (existedBefore && force) {
    overwritten += 1;
  } else {
    created += 1;
  }
}

console.log("\n[governance:init] Completed.");
console.log(`- created: ${created}`);
console.log(`- overwritten: ${force ? overwritten : 0}`);
console.log(`- skipped: ${skipped}`);
console.log("Run `npm run release:check` to verify readiness.");
