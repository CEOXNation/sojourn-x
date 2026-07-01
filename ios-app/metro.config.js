// Metro bundler configuration for the SojournX iOS standalone project.
// Watches the monorepo root so shared source (src/, BetaApp.tsx, etc.) is bundled.
// Vercel web-only packages are replaced with inert stubs.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 1. Watch the parent directory for shared source files.
config.watchFolders = [workspaceRoot];

// 2. Resolve node_modules from the iOS project first, then from the workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules")
];

// 3. Redirect web-only Vercel packages to local no-op stubs.
config.resolver.extraNodeModules = {
  "@vercel/analytics": path.resolve(projectRoot, "mocks/vercel-analytics.js"),
  "@vercel/analytics/react": path.resolve(projectRoot, "mocks/vercel-analytics.js"),
  "@vercel/speed-insights": path.resolve(projectRoot, "mocks/vercel-speed-insights.js"),
  "@vercel/speed-insights/react": path.resolve(projectRoot, "mocks/vercel-speed-insights.js"),
  "react-dom": path.resolve(projectRoot, "mocks/react-dom.js")
};

module.exports = config;
