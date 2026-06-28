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

export const spiritualTarotDeck = [
  {
    name: "The Fool",
    arcana: "Major Arcana · 0",
    intendedMeaning:
      "A sacred leap into the unknown where trust, curiosity, and spiritual openness begin the next path.",
    light: "Fresh starts, innocence, inspired movement.",
    shadow: "Naivety, impulsive choices, ungrounded risk.",
    embodiment: "Take one brave step today without forcing the whole map."
  },
  {
    name: "The Magician",
    arcana: "Major Arcana · I",
    intendedMeaning:
      "The channel between spirit and reality; focused intention turns inner vision into lived experience.",
    light: "Manifestation, willpower, aligned action.",
    shadow: "Manipulation, scattered focus, ego control.",
    embodiment: "Choose one intention and match it with one concrete action."
  },
  {
    name: "The High Priestess",
    arcana: "Major Arcana · II",
    intendedMeaning:
      "Inner knowing, mystery, and intuition become the primary source of guidance before outer noise.",
    light: "Intuition, hidden wisdom, spiritual listening.",
    shadow: "Emotional withdrawal, secrecy, over-isolation.",
    embodiment: "Spend ten quiet minutes listening before making a decision."
  },
  {
    name: "The Star",
    arcana: "Major Arcana · XVII",
    intendedMeaning:
      "Divine renewal after challenge; faith and healing return when the soul reconnects with purpose.",
    light: "Hope, healing, trust in the unfolding.",
    shadow: "Discouragement, disconnection, spiritual fatigue.",
    embodiment: "Name one future you still believe in and feed it with care."
  },
  {
    name: "The Moon",
    arcana: "Major Arcana · XVIII",
    intendedMeaning:
      "A descent into the subconscious where fear, dream, and truth must be felt rather than controlled.",
    light: "Dream intelligence, emotional depth, symbolic messages.",
    shadow: "Confusion, projection, anxiety loops.",
    embodiment: "Journal what you feel before trying to explain it."
  },
  {
    name: "Judgement",
    arcana: "Major Arcana · XX",
    intendedMeaning:
      "Spiritual awakening through accountability; you answer the call to become who you were meant to be.",
    light: "Rebirth, calling, clear self-honesty.",
    shadow: "Self-criticism, avoidance, fear of transformation.",
    embodiment: "Release one old identity script and choose a truer one."
  }
];

export const spiritualRuneSet = [
  {
    name: "Fehu",
    symbol: "ᚠ",
    intendedMeaning:
      "Sacred flow of wealth, vitality, and resources; what you value grows when it is tended with integrity.",
    light: "Prosperity, movement, earned momentum.",
    shadow: "Greed, depletion, clinging to control.",
    embodiment: "Protect your energy and invest it where value is reciprocal."
  },
  {
    name: "Uruz",
    symbol: "ᚢ",
    intendedMeaning:
      "Primal life force and resilience; strength is recovered by inhabiting the body and trusting instinct.",
    light: "Vital power, courage, grounded stamina.",
    shadow: "Force without wisdom, rigidity, burnout.",
    embodiment: "Choose disciplined action over emotional reactivity."
  },
  {
    name: "Ansuz",
    symbol: "ᚨ",
    intendedMeaning:
      "Divine communication, inspired speech, and sacred listening; messages arrive through words and signs.",
    light: "Wisdom transmission, clarity, inspired expression.",
    shadow: "Miscommunication, gossip, ignored guidance.",
    embodiment: "Speak one truth clearly and listen deeply in return."
  },
  {
    name: "Raidho",
    symbol: "ᚱ",
    intendedMeaning:
      "Right-timed journey and soul alignment; movement is blessed when direction and purpose match.",
    light: "Alignment, pilgrimage, ordered progress.",
    shadow: "Aimlessness, resistance, disrupted rhythm.",
    embodiment: "Realign your schedule with your actual priorities."
  },
  {
    name: "Kenaz",
    symbol: "ᚲ",
    intendedMeaning:
      "Torch of insight and transformation; illumination burns away what no longer belongs.",
    light: "Creative fire, revelation, skill mastery.",
    shadow: "Blocked creativity, exhaustion, false certainty.",
    embodiment: "Focus your energy on one craft and refine it with devotion."
  },
  {
    name: "Algiz",
    symbol: "ᛉ",
    intendedMeaning:
      "Protection, higher guidance, and spiritual boundaries; safety rises when your alignment is clean.",
    light: "Protection, intuitive defense, trusted support.",
    shadow: "Hypervigilance, isolation, defensive posture.",
    embodiment: "Set a clear boundary and keep your energy field intentional."
  }
];

export const spiritualBirthChart = {
  identity: {
    sun: "Scorpio",
    moon: "Pisces",
    rising: "Leo",
    northNode: "Aries"
  },
  placements: [
    {
      body: "Sun · Scorpio · 8th House",
      meaning: "Transformation, depth work, emotional alchemy, and fearless truth-seeking."
    },
    {
      body: "Moon · Pisces · 4th House",
      meaning: "Mystical emotional sensitivity, dream intelligence, and deep ancestral memory."
    },
    {
      body: "Rising · Leo · 1st House",
      meaning: "Radiant spiritual presence, heart-led leadership, and creative self-expression."
    },
    {
      body: "Mercury · Sagittarius · 5th House",
      meaning: "Visionary storytelling, philosophical insight, and prophetic creative language."
    },
    {
      body: "Venus · Libra · 3rd House",
      meaning: "Harmony in communication, relational grace, and beauty through dialogue."
    },
    {
      body: "Mars · Capricorn · 6th House",
      meaning: "Disciplined action, spiritual work ethic, and practical mastery through routine."
    }
  ]
};

export const spiritualAstrologicalWeather = [
  {
    title: "Lunar Phase · Waxing Gibbous",
    meaning: "Refinement energy is high; tighten intention before the next full-moon reveal."
  },
  {
    title: "Current Season · Cancer",
    meaning: "Emotional truth and sacred belonging are highlighted across relationship themes."
  },
  {
    title: "Transit Focus · Saturn in Pisces",
    meaning: "Turn spiritual insight into structure; devotion must become a daily practice."
  },
  {
    title: "Collective Signal · Venus Trine Neptune",
    meaning: "Art, love, and mysticism are amplified; choose beauty that is also honest."
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