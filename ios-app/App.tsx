// Re-export the shared BetaApp. Vercel web analytics are mocked via metro.config.js
// so they resolve to no-ops and are never rendered (Platform.OS === "web" guard).
export { default } from "../BetaApp";
