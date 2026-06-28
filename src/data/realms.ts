import type { Realm, RealmEnvironment } from "../types";

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

export const realmEnvironments: Record<Realm["key"], RealmEnvironment> = {
  anonymous: {
    realmKey: "anonymous",
    mission: "Give people a safe place to express truth without identity performance.",
    atmosphere: "Low-light, high-safety, consent-first expression zone.",
    modules: [
      {
        name: "Confession Channels",
        description: "Threaded posts with emotion-aware prompts and optional anonymity shields.",
        capabilities: ["Anonymous posting", "Topic routing", "Safety filters"]
      },
      {
        name: "Courage Questions",
        description: "Question walls designed for vulnerable conversations and peer support.",
        capabilities: ["Prompt pools", "Community replies", "Context tags"]
      },
      {
        name: "Silent Reflection",
        description: "Private thought scratchpad for drafting before posting publicly in-realm.",
        capabilities: ["Private drafts", "Mood tagging", "One-tap publish"]
      }
    ],
    blendTargets: ["growth", "spiritual", "messaging"]
  },
  social: {
    realmKey: "social",
    mission: "Enable visible identity when users choose to be seen.",
    atmosphere: "Clean, expressive, profile-forward social canvas.",
    modules: [
      {
        name: "Identity Profiles",
        description: "Flexible profiles with selective visibility and layered audience controls.",
        capabilities: ["Profile controls", "Follower modes", "Presence indicators"]
      },
      {
        name: "Story Streams",
        description: "Media and text streams that can map directly to active personal themes.",
        capabilities: ["Stories", "Post scheduling", "Realm cross-posting"]
      },
      {
        name: "Circle Graph",
        description: "Friends and followers graph with trust tiers and circle-based visibility.",
        capabilities: ["Circle roles", "Trust tiers", "Selective reach"]
      }
    ],
    blendTargets: ["messaging", "marketplace", "growth"]
  },
  messaging: {
    realmKey: "messaging",
    mission: "Protect private communication inside and across realms.",
    atmosphere: "Quiet, direct, private corridor for trusted exchange.",
    modules: [
      {
        name: "Private Threads",
        description: "One-to-one and small group conversations with privacy-first defaults.",
        capabilities: ["Direct chat", "Group threads", "Read privacy"]
      },
      {
        name: "Ephemeral Mode",
        description: "Timed message behavior for sensitive conversations.",
        capabilities: ["Message expiry", "Screenshot cues", "Session locks"]
      },
      {
        name: "Signal Relay",
        description: "Route interactions from other realms into secure conversation rooms.",
        capabilities: ["Realm handoff", "Context cards", "Secure replies"]
      }
    ],
    blendTargets: ["anonymous", "social", "marketplace"]
  },
  marketplace: {
    realmKey: "marketplace",
    mission: "Facilitate trusted exchange without sacrificing privacy.",
    atmosphere: "Curated exchange hall with trust, verification, and calm.",
    modules: [
      {
        name: "Sacred Listings",
        description: "Structured listings for physical, digital, and service-based offerings.",
        capabilities: ["Listing templates", "Verification badges", "Privacy tiers"]
      },
      {
        name: "Offer Vault",
        description: "Secure offer and negotiation lane between buyers and sellers.",
        capabilities: ["Private offers", "Escrow-ready flow", "Negotiation trails"]
      },
      {
        name: "Delivery Loop",
        description: "Status and fulfillment lifecycle designed for transparency.",
        capabilities: ["Status tracking", "Proof upload", "Completion receipts"]
      }
    ],
    blendTargets: ["messaging", "social", "growth"]
  },
  spiritual: {
    realmKey: "spiritual",
    mission: "Support grounding, reflection, and symbolic meaning-making.",
    atmosphere: "Slow, contemplative temple-like environment.",
    modules: [
      {
        name: "Daily Rituals",
        description: "Daily check-ins and grounding prompts to anchor attention.",
        capabilities: ["Ritual prompts", "Check-in cadence", "Streak memory"]
      },
      {
        name: "Symbolic Pulls",
        description: "Tarot/rune-inspired symbolic cards for reflection and journaling.",
        capabilities: ["Card pulls", "Interpretation cues", "Journal handoff"]
      },
      {
        name: "Meditation Vault",
        description: "Guided and silent meditation sessions linked to emotional state.",
        capabilities: ["Guided sessions", "Breath timers", "Post-session notes"]
      }
    ],
    blendTargets: ["growth", "anonymous", "messaging"]
  },
  growth: {
    realmKey: "growth",
    mission: "Turn self-observation into intentional personal evolution.",
    atmosphere: "Structured progress studio with reflective analytics.",
    modules: [
      {
        name: "Pattern Lens",
        description: "Surface recurring emotional and behavioral patterns over time.",
        capabilities: ["Mood trends", "Pattern detection", "Insight highlights"]
      },
      {
        name: "Identity Arcs",
        description: "Track where the user has been and who they are becoming.",
        capabilities: ["Arc timelines", "Milestone markers", "Theme clustering"]
      },
      {
        name: "Habit Signals",
        description: "Connect actions, reflections, and outcomes into practical loops.",
        capabilities: ["Habit tracking", "Reminder loops", "Outcome notes"]
      }
    ],
    blendTargets: ["spiritual", "anonymous", "social"]
  }
};