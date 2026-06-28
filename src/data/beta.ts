import type { JournalEntry, PulsePost, RealmKey } from "../types";
import { anonymousPosts } from "./realms";

const startedAt = Date.now();

function hoursAgo(hours: number): string {
  return new Date(startedAt - hours * 60 * 60 * 1000).toISOString();
}

export const betaTabs = ["Home", "Pulse", "Realms", "Journal", "Profile", "Settings"] as const;

export const betaAvatarOptions = ["X", "✦", "◈", "☽", "⚡", "△", "☉", "⬡", "❖", "⟡"] as const;

export const betaMoods = [
  "Grounded",
  "Focused",
  "Curious",
  "Luminous",
  "Protected",
  "Rebuilding"
];

export const betaChecklist = [
  {
    title: "Age gate active",
    detail: "Adults-only entry stays in front of the vault."
  },
  {
    title: "Profile persistence",
    detail: "Identity settings stay local to the device."
  },
  {
    title: "Pulse feed",
    detail: "Anonymous drafts can be published into the vault."
  },
  {
    title: "Journal continuity",
    detail: "Reflection entries are written back to storage."
  },
  {
    title: "Realm switching",
    detail: "Users can choose a home realm and preview others."
  }
];

export const betaPulseSeed: PulsePost[] = [
  {
    id: "seed-pulse-1",
    author: "Shadow Observer",
    realmKey: "anonymous",
    mood: "Grounded",
    body: anonymousPosts[0].title,
    createdAt: hoursAgo(8),
    replies: 42
  },
  {
    id: "seed-pulse-2",
    author: "Identity Work",
    realmKey: "growth",
    mood: "Curious",
    body: anonymousPosts[1].title,
    createdAt: hoursAgo(13),
    replies: 18
  },
  {
    id: "seed-pulse-3",
    author: "Vault Listener",
    realmKey: "social",
    mood: "Focused",
    body: anonymousPosts[2].title,
    createdAt: hoursAgo(24),
    replies: 27
  }
];

export const betaJournalSeed: JournalEntry[] = [
  {
    id: "seed-journal-1",
    mood: "Focused",
    reflection:
      "The first beta should prove the vault can hold both anonymity and continuity.",
    createdAt: hoursAgo(10)
  },
  {
    id: "seed-journal-2",
    mood: "Grounded",
    reflection:
      "If the profile survives closing the app, the user already feels safer inside the realm.",
    createdAt: hoursAgo(27)
  }
];

export const betaRealmPreviewOrder: RealmKey[] = [
  "anonymous",
  "social",
  "messaging",
  "marketplace",
  "spiritual",
  "growth"
];