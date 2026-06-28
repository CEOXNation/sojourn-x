export type RealmKey =
  | "anonymous"
  | "social"
  | "messaging"
  | "marketplace"
  | "spiritual"
  | "growth";

export type Realm = {
  key: RealmKey;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  promise: string;
  features: string[];
};

export type RealmEnvironmentModule = {
  name: string;
  description: string;
  capabilities: string[];
};

export type RealmEnvironment = {
  realmKey: RealmKey;
  mission: string;
  atmosphere: string;
  modules: RealmEnvironmentModule[];
  blendTargets: RealmKey[];
};

export type UiAccent = "crimson" | "sunset" | "emerald" | "electric" | "amber";

export type UiStylePreset = "vault" | "glass" | "mono";

export type UiScale = "compact" | "balanced" | "immersive";

export type UiPreferences = {
  accent: UiAccent;
  style: UiStylePreset;
  scale: UiScale;
};

export type NavTab = BetaTab;

export type BetaTab = "Home" | "Pulse" | "Realms" | "Journal" | "Settings";

export type BetaProfile = {
  handle: string;
  pronouns: string;
  bio: string;
  homeRealm: RealmKey;
  privateMode: boolean;
  onboardingComplete: boolean;
};

export type PulsePost = {
  id: string;
  author: string;
  realmKey: RealmKey;
  mood: string;
  body: string;
  createdAt: string;
  replies: number;
};

export type JournalEntry = {
  id: string;
  mood: string;
  reflection: string;
  createdAt: string;
};