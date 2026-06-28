import type { Realm } from "../types";

export const realms: Realm[] = [
  {
    key: "anonymous",
    title: "Anonymous Realm",
    shortTitle: "Anonymous",
    icon: "◼",
    description:
      "A shadow forum inside a luxury vault where users can speak honestly without identity pressure.",
    promise: "Speak freely without performing.",
    features: [
      "Anonymous posting",
      "Topic-based communities",
      "Confessions and questions",
      "Private reflections",
      "Emotionally intelligent moderation"
    ]
  },
  {
    key: "social",
    title: "Social Realm",
    shortTitle: "Social",
    icon: "◆",
    description:
      "A familiar social layer with profiles, posts, stories, friends, followers, and identity control.",
    promise: "Be seen only when you choose.",
    features: [
      "Profiles",
      "Posts and stories",
      "Photos and reels",
      "Friends and followers",
      "Profile visibility controls"
    ]
  },
  {
    key: "messaging",
    title: "Private Messaging Realm",
    shortTitle: "Private",
    icon: "✦",
    description:
      "A silent chamber for private conversations, secret groups, encrypted-style chats, and disappearing-message concepts.",
    promise: "Your private chamber inside the app.",
    features: [
      "Private chats",
      "Secret groups",
      "Self-destructing message concepts",
      "Encrypted voice-note concept",
      "Offline-style messaging roadmap"
    ]
  },
  {
    key: "marketplace",
    title: "Marketplace Realm",
    shortTitle: "Market",
    icon: "⬡",
    description:
      "A privacy-first marketplace that feels sacred, curated, and secure rather than noisy and commercial.",
    promise: "Exchange without exposure.",
    features: [
      "Anonymous listings",
      "Verified listings",
      "Private seller chats",
      "Digital goods",
      "Services and spiritual items"
    ]
  },
  {
    key: "spiritual",
    title: "Spiritual Realm",
    shortTitle: "Spirit",
    icon: "☽",
    description:
      "An inner temple for daily reflections, symbolic pulls, emotional check-ins, meditation prompts, and shadow work.",
    promise: "Open the app and feel grounded.",
    features: [
      "Daily reflections",
      "Tarot/rune-inspired pulls",
      "Guided meditation prompts",
      "Emotional check-ins",
      "Shadow work prompts"
    ]
  },
  {
    key: "growth",
    title: "Self-Development Realm",
    shortTitle: "Growth",
    icon: "▲",
    description:
      "A personal evolution dashboard that helps users understand patterns, moods, cycles, habits, and identity themes.",
    promise: "Track who you are becoming.",
    features: [
      "Mood tracking",
      "Growth arcs",
      "Identity themes",
      "Habit signals",
      "Reflection history"
    ]
  }
];

export const anonymousPosts = [
  {
    title: "I needed somewhere to say this without being watched.",
    community: "Shadow Thoughts",
    replies: 42
  },
  {
    title: "What version of yourself are you becoming right now?",
    community: "Identity Work",
    replies: 18
  },
  {
    title: "Today's reflection made me realize I keep hiding my ambition.",
    community: "Growth Confessions",
    replies: 27
  }
];

export const privateMessages = [
  {
    name: "Inner Circle",
    preview: "Tonight's reflection circle starts after sunset.",
    unread: 3
  },
  {
    name: "Vault Chat",
    preview: "Your last message is protected in private mode.",
    unread: 1
  },
  {
    name: "Marketplace Inquiry",
    preview: "The seller replied about the guided journal pack.",
    unread: 2
  }
];

export const marketItems = [
  {
    title: "Shadow Work Journal Pack",
    category: "Digital Goods",
    price: "$12"
  },
  {
    title: "Private Reflection Session",
    category: "Services",
    price: "$45"
  },
  {
    title: "Symbolic Meditation Audio",
    category: "Spiritual Tools",
    price: "$9"
  }
];

export const growthSignals = [
  {
    label: "Mood Cycle",
    value: "Grounded",
    detail: "Your recent check-ins show steadier emotional tone."
  },
  {
    label: "Identity Theme",
    value: "Reinvention",
    detail: "Your reflections are circling around courage and visibility."
  },
  {
    label: "Growth Arc",
    value: "Emerging",
    detail: "You are moving from hidden expression to intentional presence."
  }
];