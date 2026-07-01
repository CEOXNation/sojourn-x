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

export type UiDensity = "cozy" | "balanced" | "dense";

export type UiCorners = "soft" | "balanced" | "sharp";

export type UiTransitionStyle = "fade" | "slide" | "zoom";

export type UiTransitionSpeed = "calm" | "balanced" | "snappy";

export type UiActionStyle = "subtle" | "balanced" | "bold";

export type UiSoundPack = "soft" | "tech" | "cosmic";

export type UiPreferences = {
  accent: UiAccent;
  style: UiStylePreset;
  scale: UiScale;
  density: UiDensity;
  corners: UiCorners;
  transitionStyle: UiTransitionStyle;
  transitionSpeed: UiTransitionSpeed;
  actionStyle: UiActionStyle;
  soundEnabled: boolean;
  soundPack: UiSoundPack;
  soundVolume: number;
};

export type NavTab = BetaTab;

export type BetaTab = "Home" | "Pulse" | "Realms" | "Journal" | "Profile" | "Settings";

export type BetaProfile = {
  displayName: string;
  handle: string;
  avatar: string;
  status: string;
  phoneNumber: string;
  pronouns: string;
  bio: string;
  location: string;
  website: string;
  homeRealm: RealmKey;
  privateMode: boolean;
  contactsSyncEnabled: boolean;
  onboardingComplete: boolean;
};

export type ContactSyncPermission = "unknown" | "granted" | "denied" | "unavailable";

export type ContactMatchState = "on-sojourn" | "invite-ready" | "private-relay";

export type SyncedContact = {
  id: string;
  displayName: string;
  initials: string;
  phoneNumber: string;
  trustNote: string;
  matchState: ContactMatchState;
  realmAffinity: RealmKey;
  lastSeen: string;
  source: "device" | "preview";
};

export type ContactSyncState = {
  permission: ContactSyncPermission;
  enabled: boolean;
  lastSyncedAt: string | null;
  deviceContactCount: number;
  importedCount: number;
  source: "device" | "preview" | "none";
};

export type ContactSyncResult = {
  contacts: SyncedContact[];
  state: ContactSyncState;
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

// ─── Astrology & Spiritual ─────────────────────────────────────────────────

export type ZodiacSign =
  | "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo"
  | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

export type SpiritualElement = "fire" | "earth" | "air" | "water";

export type SpiritualPath = "seeker" | "mystic" | "warrior" | "healer" | "sage" | "creator";

export type AffirmationStyle = "gentle" | "bold" | "poetic";

export type PracticeTime = "morning" | "evening" | "flexible";

export type MoonPhaseAffinity = "new" | "waxing" | "full" | "waning";

export type SpiritualIntention =
  | "love" | "purpose" | "health" | "grief" | "identity" | "abundance"
  | "clarity" | "protection" | "creativity" | "peace";

export type BirthData = {
  birthDate: string;    // YYYY-MM-DD
  birthTime: string;    // HH:MM  (24h)
  birthPlace: string;
  hemisphere: "north" | "south";
};

export type SpiritualQuestionnaire = {
  element: SpiritualElement | "";
  spiritualPath: SpiritualPath | "";
  intentions: SpiritualIntention[];
  affirmationStyle: AffirmationStyle | "";
  practiceTime: PracticeTime | "";
  moonPhaseAffinity: MoonPhaseAffinity | "";
  oracleDeckStyle: "cosmic" | "nature" | "shadow" | "celestial" | "";
};

// ─── Realm Personalization ─────────────────────────────────────────────────

export type AnonymousPersonalization = {
  topicInterests: string[];
  postingTone: "reflective" | "direct" | "poetic" | "raw";
  personaName: string;
};

export type SocialPersonalization = {
  feedOrder: "chronological" | "curated" | "discovery";
  visibilityDefault: "public" | "circle" | "private";
  showOnlineStatus: boolean;
};

export type MessagingPersonalization = {
  messageTheme: "vault" | "midnight" | "ember";
  soundStyle: "subtle" | "silent" | "crystal";
  readReceipts: boolean;
};

export type MarketplacePersonalization = {
  categoryPreferences: string[];
  anonymousOnly: boolean;
  showPriceAlerts: boolean;
};

export type SpiritualPersonalization = {
  showDailyOracle: boolean;
  showMoonPhase: boolean;
  affirmationCount: 3 | 5 | 7;
};

export type GrowthPersonalization = {
  focusAreas: string[];
  habitFrequency: "daily" | "weekly";
  reflectionDepth: "brief" | "detailed" | "guided";
};

export type RealmPersonalization = {
  anonymous: AnonymousPersonalization;
  social: SocialPersonalization;
  messaging: MessagingPersonalization;
  marketplace: MarketplacePersonalization;
  spiritual: SpiritualPersonalization;
  growth: GrowthPersonalization;
};

// ─── Reminders ────────────────────────────────────────────────────────────

export type ReminderFrequency = "daily" | "weekdays" | "weekends" | "weekly";

export type ReminderConfig = {
  enabled: boolean;
  time: string;              // HH:MM
  frequency: ReminderFrequency;
  label: string;
};

export type RealmReminders = {
  anonymous: ReminderConfig;
  social: ReminderConfig;
  messaging: ReminderConfig;
  marketplace: ReminderConfig;
  spiritual: ReminderConfig;
  growth: ReminderConfig;
};