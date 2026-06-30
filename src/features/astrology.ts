/**
 * Astrology & spiritual calculation utilities for the Spiritual Realm.
 * All calculations are deterministic from input data — no external API calls.
 */

import type {
  AffirmationStyle,
  BirthData,
  MoonPhaseAffinity,
  SpiritualElement,
  SpiritualIntention,
  SpiritualPath,
  SpiritualQuestionnaire,
  ZodiacSign
} from "../types";

// ─── Sun Sign ─────────────────────────────────────────────────────────────

const SIGN_BOUNDARIES: Array<{ sign: ZodiacSign; month: number; day: number }> = [
  { sign: "capricorn",   month: 1,  day: 20 },
  { sign: "aquarius",    month: 2,  day: 19 },
  { sign: "pisces",      month: 3,  day: 20 },
  { sign: "aries",       month: 4,  day: 20 },
  { sign: "taurus",      month: 5,  day: 21 },
  { sign: "gemini",      month: 6,  day: 21 },
  { sign: "cancer",      month: 7,  day: 22 },
  { sign: "leo",         month: 8,  day: 23 },
  { sign: "virgo",       month: 9,  day: 23 },
  { sign: "libra",       month: 10, day: 23 },
  { sign: "scorpio",     month: 11, day: 22 },
  { sign: "sagittarius", month: 12, day: 22 },
];

export function getSunSign(birthDate: string): ZodiacSign {
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "aries";
  const month = d.getUTCMonth() + 1;
  const day   = d.getUTCDate();
  for (const b of SIGN_BOUNDARIES) {
    if (month === b.month && day < b.day) return b.sign;
    if (month < b.month)                  return SIGN_BOUNDARIES[SIGN_BOUNDARIES.indexOf(b) === 0 ? 11 : SIGN_BOUNDARIES.indexOf(b) - 1].sign;
  }
  return "sagittarius";
}

// ─── Moon Sign (approximate) ──────────────────────────────────────────────

const SIGNS: ZodiacSign[] = [
  "aries","taurus","gemini","cancer","leo","virgo",
  "libra","scorpio","sagittarius","capricorn","aquarius","pisces"
];

/** Approximate moon sign using a simplified synodic cycle. */
export function getMoonSign(birthDate: string): ZodiacSign {
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return "cancer";
  // Moon moves ~1 sign per 2.5 days; use days since J2000 mod 12
  const j2000 = new Date("2000-01-01T00:00:00Z");
  const days = Math.floor((d.getTime() - j2000.getTime()) / 86_400_000);
  return SIGNS[((Math.floor(days / 2.5) % 12) + 12) % 12];
}

// ─── Ascendant / Rising (simplified) ─────────────────────────────────────

/** Approximate rising sign from birth time (each sign rises ~2 hours). */
export function getAscendant(birthTime: string, birthDate: string): ZodiacSign {
  const sun = getSunSign(birthDate);
  const sunIndex = SIGNS.indexOf(sun);
  const parts = birthTime.split(":");
  const hour = parseInt(parts[0] ?? "6", 10);
  const offset = Math.floor(hour / 2);
  return SIGNS[(sunIndex + offset) % 12];
}

// ─── Current Moon Phase ───────────────────────────────────────────────────

export type MoonPhaseInfo = {
  phase: MoonPhaseAffinity;
  label: string;
  emoji: string;
  meaning: string;
};

export function getCurrentMoonPhase(): MoonPhaseInfo {
  const known = new Date("2000-01-06T18:14:00Z"); // known new moon
  const now = new Date();
  const elapsed = (now.getTime() - known.getTime()) / 86_400_000;
  const cycle = elapsed % 29.53;
  if (cycle < 7.38)  return { phase: "new",    label: "New Moon",       emoji: "🌑", meaning: "Plant seeds, set intentions, begin anew." };
  if (cycle < 14.77) return { phase: "waxing",  label: "Waxing Moon",    emoji: "🌔", meaning: "Build momentum, attract growth, take action." };
  if (cycle < 22.15) return { phase: "full",    label: "Full Moon",      emoji: "🌕", meaning: "Illuminate truth, celebrate, release what no longer serves." };
  return              { phase: "waning",  label: "Waning Moon",    emoji: "🌘", meaning: "Let go, rest, integrate lessons, prepare for renewal." };
}

// ─── Chinese Zodiac ───────────────────────────────────────────────────────

const CHINESE_ANIMALS = [
  "Rat","Ox","Tiger","Rabbit","Dragon","Snake",
  "Horse","Goat","Monkey","Rooster","Dog","Pig"
];
const CHINESE_ELEMENTS = ["Metal","Water","Wood","Fire","Earth"];

export function getChineseZodiac(birthYear: number): { animal: string; element: string } {
  const animal  = CHINESE_ANIMALS[((birthYear - 1900) % 12 + 12) % 12];
  const element = CHINESE_ELEMENTS[Math.floor(((birthYear - 1900) % 10) / 2)];
  return { animal, element };
}

// ─── Life Path Number (Numerology) ────────────────────────────────────────

function reduceDigits(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split("").reduce((a, d) => a + parseInt(d), 0);
  }
  return n;
}

export function getLifePathNumber(birthDate: string): number {
  const d = new Date(birthDate);
  if (isNaN(d.getTime())) return 1;
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + 1;
  const day = d.getUTCDate();
  return reduceDigits(
    reduceDigits(y) + reduceDigits(m) + reduceDigits(day)
  );
}

// ─── Element ──────────────────────────────────────────────────────────────

const SIGN_ELEMENT: Record<ZodiacSign, SpiritualElement> = {
  aries: "fire", leo: "fire", sagittarius: "fire",
  taurus: "earth", virgo: "earth", capricorn: "earth",
  gemini: "air", libra: "air", aquarius: "air",
  cancer: "water", scorpio: "water", pisces: "water"
};

export function getElement(sign: ZodiacSign): SpiritualElement {
  return SIGN_ELEMENT[sign];
}

// ─── Modality ─────────────────────────────────────────────────────────────

const SIGN_MODALITY: Record<ZodiacSign, string> = {
  aries: "Cardinal", cancer: "Cardinal", libra: "Cardinal", capricorn: "Cardinal",
  taurus: "Fixed", leo: "Fixed", scorpio: "Fixed", aquarius: "Fixed",
  gemini: "Mutable", virgo: "Mutable", sagittarius: "Mutable", pisces: "Mutable"
};

export function getModality(sign: ZodiacSign): string {
  return SIGN_MODALITY[sign];
}

// ─── Sign Meta ────────────────────────────────────────────────────────────

export type SignMeta = {
  glyph: string;
  ruling: string;
  keywords: string[];
  shadow: string;
};

const SIGN_META: Record<ZodiacSign, SignMeta> = {
  aries:       { glyph: "♈", ruling: "Mars",    keywords: ["Courage","Initiative","Vitality"],    shadow: "Impulsivity" },
  taurus:      { glyph: "♉", ruling: "Venus",   keywords: ["Stability","Sensuality","Patience"],  shadow: "Stubbornness" },
  gemini:      { glyph: "♊", ruling: "Mercury", keywords: ["Curiosity","Wit","Adaptability"],     shadow: "Inconsistency" },
  cancer:      { glyph: "♋", ruling: "Moon",    keywords: ["Intuition","Nurture","Memory"],       shadow: "Moodiness" },
  leo:         { glyph: "♌", ruling: "Sun",     keywords: ["Radiance","Generosity","Confidence"], shadow: "Ego" },
  virgo:       { glyph: "♍", ruling: "Mercury", keywords: ["Precision","Devotion","Discernment"], shadow: "Perfectionism" },
  libra:       { glyph: "♎", ruling: "Venus",   keywords: ["Balance","Harmony","Justice"],        shadow: "Indecision" },
  scorpio:     { glyph: "♏", ruling: "Pluto",   keywords: ["Depth","Transformation","Power"],     shadow: "Obsession" },
  sagittarius: { glyph: "♐", ruling: "Jupiter", keywords: ["Freedom","Wisdom","Optimism"],        shadow: "Restlessness" },
  capricorn:   { glyph: "♑", ruling: "Saturn",  keywords: ["Discipline","Ambition","Mastery"],    shadow: "Coldness" },
  aquarius:    { glyph: "♒", ruling: "Uranus",  keywords: ["Innovation","Rebellion","Humanity"],  shadow: "Detachment" },
  pisces:      { glyph: "♓", ruling: "Neptune", keywords: ["Compassion","Mysticism","Dreams"],    shadow: "Escapism" },
};

export function getSignMeta(sign: ZodiacSign): SignMeta {
  return SIGN_META[sign];
}

// ─── Planetary Influence of the Day ───────────────────────────────────────

const DAILY_PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn"];
const PLANET_MESSAGES: Record<string, string> = {
  Sun:     "Solar energy amplifies self-expression. Own your light today.",
  Moon:    "Lunar tides heighten emotion and intuition. Honor your feelings.",
  Mars:    "Martian drive fuels action. Channel ambition into purposeful effort.",
  Mercury: "Mercurial currents sharpen communication. Speak and listen with care.",
  Jupiter: "Jovian expansion opens doors. Follow the thread of abundance.",
  Venus:   "Venusian vibration softens the world. Lead with love and beauty.",
  Saturn:  "Saturnine structure demands discipline. One focused step is enough.",
};

export function getDailyPlanet(): { planet: string; message: string } {
  const dayIndex = Math.floor(Date.now() / 86_400_000) % 7;
  const planet = DAILY_PLANETS[dayIndex];
  return { planet, message: PLANET_MESSAGES[planet] };
}

// ─── Daily Affirmations ───────────────────────────────────────────────────

const AFFIRMATIONS_BY_ELEMENT: Record<SpiritualElement, string[]> = {
  fire:  [
    "I ignite the world with my authentic presence.",
    "My passion is a sacred flame that lights the path for others.",
    "I act boldly from a place of inner truth.",
    "Courage flows through me like an eternal fire.",
    "I transform obstacles into fuel for my ascension.",
    "My desires are divine messengers guiding my purpose.",
    "I lead with warmth and I lead with vision.",
  ],
  earth: [
    "I am rooted, resilient, and ready to receive abundance.",
    "My body is a sacred vessel; I tend it with devotion.",
    "I build slowly, with intention, and my foundations hold.",
    "Nature mirrors my inner wisdom — patient, generous, enduring.",
    "I trust the timing of the seasons within my own life.",
    "Security grows in me like roots reaching deep into the earth.",
    "I am steady ground for myself and for those I love.",
  ],
  air:   [
    "My mind is a clear sky — vast, bright, and ever open.",
    "I communicate my truth with grace and precision.",
    "Ideas flow through me like wind — free, refreshing, alive.",
    "I connect with others in ways that liberate rather than bind.",
    "Curiosity is my greatest spiritual gift.",
    "I breathe in possibility and exhale limitation.",
    "My thoughts shape reality — I choose expansive ones.",
  ],
  water: [
    "I flow with life rather than resist it.",
    "My emotions are sacred data, not obstacles.",
    "Depth is my superpower. I dive where others will not.",
    "I am intuitive, empathic, and profoundly wise.",
    "My sensitivity is a gift that opens me to the divine.",
    "Healing flows through me naturally to myself and others.",
    "I trust the unseen currents that move my life forward.",
  ],
};

const AFFIRMATIONS_BY_PATH: Record<SpiritualPath, string[]> = {
  seeker:  ["Every question I ask brings me closer to truth.", "The journey itself is the sacred teaching."],
  mystic:  ["I walk between worlds with grace and purpose.", "The veil is thin, and I am welcome on both sides."],
  warrior: ["I fight for what is sacred with integrity and fire.", "My strength protects what matters most."],
  healer:  ["I am a channel for love and restoration.", "My presence alone creates space for healing."],
  sage:    ["Ancient wisdom lives in me; I speak it at the right moment.", "I hold space with the patience of the cosmos."],
  creator: ["I co-create reality with the universe each day.", "My imagination is a portal to divine possibility."],
};

const AFFIRMATIONS_BY_INTENTION: Record<SpiritualIntention, string> = {
  love:       "I am worthy of deep, transformative love. It finds me now.",
  purpose:    "My purpose is unfolding perfectly, even in the mystery.",
  health:     "Every cell in my body radiates vitality and wholeness.",
  grief:      "I honor my grief as proof of how deeply I have loved.",
  identity:   "I am enough exactly as I am and exactly as I am becoming.",
  abundance:  "Abundance is my birthright. I receive it with open hands.",
  clarity:    "The fog lifts. My path is illuminated step by step.",
  protection: "I am held and protected by something greater than myself.",
  creativity: "Creative energy moves through me endlessly and freely.",
  peace:      "I return to stillness. Peace is always available to me.",
};

const AFFIRMATIONS_BY_STYLE: Record<AffirmationStyle, (base: string) => string> = {
  gentle:  (s) => s,
  bold:    (s) => s.replace(/I am /g, "I am powerfully ").replace(/I /g, "I boldly ").replace(/My /g, "My fierce "),
  poetic:  (s) => s + " — and so it is written in the stars.",
};

export function getDailyAffirmations(
  q: SpiritualQuestionnaire,
  birthDate: string,
  count: 3 | 5 | 7 = 5
): string[] {
  const sun     = getSunSign(birthDate);
  const element = (q.element || getElement(sun)) as SpiritualElement;
  const style   = (q.affirmationStyle || "gentle") as AffirmationStyle;
  const path    = q.spiritualPath as SpiritualPath | "";

  // Deterministic daily selection based on day of year
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );

  const elementPool = AFFIRMATIONS_BY_ELEMENT[element];
  const pathPool = path ? AFFIRMATIONS_BY_PATH[path] : [];
  const intentionPick = q.intentions[0]
    ? AFFIRMATIONS_BY_INTENTION[q.intentions[0]]
    : elementPool[(dayOfYear + 3) % elementPool.length];

  const raw: string[] = [
    elementPool[dayOfYear % elementPool.length],
    elementPool[(dayOfYear + 2) % elementPool.length],
    intentionPick,
    pathPool[dayOfYear % Math.max(pathPool.length, 1)] ?? elementPool[(dayOfYear + 4) % elementPool.length],
    q.intentions[1] ? AFFIRMATIONS_BY_INTENTION[q.intentions[1]] : elementPool[(dayOfYear + 5) % elementPool.length],
    elementPool[(dayOfYear + 6) % elementPool.length],
    pathPool[(dayOfYear + 1) % Math.max(pathPool.length, 1)] ?? elementPool[(dayOfYear + 1) % elementPool.length],
  ];

  const transform = AFFIRMATIONS_BY_STYLE[style];
  return [...new Set(raw.slice(0, count).map(transform))];
}

// ─── Oracle Cards ─────────────────────────────────────────────────────────

export type OracleCard = {
  name: string;
  emoji: string;
  meaning: string;
  guidance: string;
  reversed?: string;
};

const ORACLE_DECKS: Record<string, OracleCard[]> = {
  cosmic: [
    { name: "The Void",       emoji: "✦", meaning: "Infinite potential",  guidance: "Step into the unknown with trust. What seems empty holds everything.",        reversed: "Avoidance of necessary change." },
    { name: "Stellar Birth",  emoji: "⭐", meaning: "New beginnings",      guidance: "Something sacred is being born within you. Give it space to emerge.",         reversed: "Resistance to growth." },
    { name: "Nebula Heart",   emoji: "💫", meaning: "Emotional creation",  guidance: "Your feelings are the raw material of your next reality. Create consciously.", reversed: "Clouded judgment." },
    { name: "Eclipse",        emoji: "🌑", meaning: "Hidden truth",        guidance: "What is concealed is about to be revealed. Remain open.",                       reversed: "Self-deception." },
    { name: "Cosmic Web",     emoji: "🌐", meaning: "Interconnection",     guidance: "Every choice ripples outward. Choose with the awareness of your impact.",       reversed: "Isolation." },
    { name: "Supernova",      emoji: "💥", meaning: "Transformation",      guidance: "Something must end brilliantly so something greater can begin.",               reversed: "Clinging to the familiar." },
    { name: "The Comet",      emoji: "☄️", meaning: "Swift change",        guidance: "Move decisively. This window of opportunity is brief and bright.",             reversed: "Impulsive action." },
    { name: "Dark Matter",    emoji: "◼", meaning: "The unseen forces",    guidance: "Trust what you cannot yet see. The unseen is holding you together.",           reversed: "Paranoia." },
  ],
  nature: [
    { name: "Ancient Oak",    emoji: "🌳", meaning: "Strength & roots",    guidance: "Stand firm. Your depth of roots is what allows your branches to reach far.",   reversed: "Rigidity." },
    { name: "Wild River",     emoji: "🌊", meaning: "Flow & release",      guidance: "Stop fighting the current. Surrender is not weakness — it is wisdom.",         reversed: "Resistance." },
    { name: "Wildfire",       emoji: "🔥", meaning: "Purification",        guidance: "Let what no longer belongs burn away. Renewal follows.",                       reversed: "Destruction without purpose." },
    { name: "Morning Dew",    emoji: "💧", meaning: "Gentle new starts",   guidance: "Softness is strength. Begin again with gentle presence.",                      reversed: "Missed opportunity." },
    { name: "Mountain Summit",emoji: "🏔",  meaning: "Clarity & vision",   guidance: "Rise above the noise. From up here, your path becomes clear.",                 reversed: "Isolation from others." },
    { name: "Full Bloom",     emoji: "🌸", meaning: "Beauty & expression", guidance: "You are in your season. Don't hide your blooming.",                           reversed: "Premature withering." },
    { name: "Deep Roots",     emoji: "🌱", meaning: "Patience & growth",   guidance: "What is growing in you cannot be rushed. Trust the underground work.",         reversed: "Impatience." },
    { name: "Storm Passage",  emoji: "⛈",  meaning: "Necessary disruption", guidance: "The storm clears what was stagnant. You will emerge cleansed.",              reversed: "Unnecessary suffering." },
  ],
  shadow: [
    { name: "The Mirror",     emoji: "🪞", meaning: "Self-reflection",     guidance: "What triggers you is what waits to be healed within you. Look bravely.",      reversed: "Self-avoidance." },
    { name: "The Wound",      emoji: "🩸", meaning: "Sacred pain",         guidance: "Your wound is your initiation. It holds the medicine you are here to offer.",  reversed: "Victimhood." },
    { name: "Shadow Self",    emoji: "👤", meaning: "Integration",         guidance: "Welcome the hidden parts of yourself. They hold tremendous power.",            reversed: "Suppression." },
    { name: "The Ending",     emoji: "🕯", meaning: "Death & rebirth",     guidance: "Something is completing. Honor it and release it with gratitude.",            reversed: "Refusal to let go." },
    { name: "The Mask",       emoji: "🎭", meaning: "False identity",      guidance: "Remove what you've worn for others. Your true face is your greatest power.",   reversed: "Deep inauthenticity." },
    { name: "The Labyrinth",  emoji: "🌀", meaning: "Inner journey",       guidance: "The way out is the way through. Trust the spiral of your own process.",       reversed: "Confusion and avoidance." },
    { name: "The Threshold",  emoji: "🚪", meaning: "Sacred crossing",     guidance: "You stand at a doorway. Step forward — you have been ready longer than you know.", reversed: "Hesitation." },
    { name: "Ancestral Call", emoji: "🌿", meaning: "Lineage healing",     guidance: "Your healing ripples backward and forward through your bloodline. You are the one.", reversed: "Unresolved ancestral patterns." },
  ],
  celestial: [
    { name: "The Moon",       emoji: "🌙", meaning: "Intuition & cycles",  guidance: "Trust what you feel in the dark. Your instincts are your finest instrument.", reversed: "Illusion." },
    { name: "The Star",       emoji: "⭐", meaning: "Hope & renewal",      guidance: "After the storm, the star remains. Hold onto the light within you.",          reversed: "Despair." },
    { name: "The Sun",        emoji: "☀️", meaning: "Vitality & clarity",  guidance: "Step into the full light of your potential. Today is a day to shine.",        reversed: "Burnout." },
    { name: "Venus Rising",   emoji: "♀", meaning: "Love & magnetism",    guidance: "You are magnetic when you are genuine. Let yourself be seen and loved.",       reversed: "Walls up." },
    { name: "Saturn's Ring",  emoji: "🪐", meaning: "Discipline & karma",  guidance: "What you resist persists. What you commit to transforms.",                    reversed: "Avoidance of responsibility." },
    { name: "Jupiter's Gift", emoji: "✨", meaning: "Expansion & luck",    guidance: "Say yes to what excites you. The universe is opening a door.",                reversed: "Overreach." },
    { name: "Mars Ignites",   emoji: "🔴", meaning: "Courage & action",   guidance: "Stop preparing. Begin. Action is the sacred answer.",                          reversed: "Aggression." },
    { name: "Mercury Wings",  emoji: "💬", meaning: "Communication",       guidance: "Say the thing you've been afraid to say. The words will create the opening.",  reversed: "Miscommunication." },
  ],
};

export function getDailyOracleCard(
  deckStyle: string = "celestial"
): OracleCard {
  const deck = ORACLE_DECKS[deckStyle] ?? ORACLE_DECKS["celestial"];
  const dayIndex = Math.floor(Date.now() / 86_400_000) % deck.length;
  return deck[dayIndex];
}

// ─── Spiritual Growth Prompts ─────────────────────────────────────────────

const REFLECTION_PROMPTS: Record<SpiritualPath | "default", string[]> = {
  seeker:  ["What question is living inside you that you haven't dared to ask?","Where is your edge right now — and are you approaching it?"],
  mystic:  ["What vision or symbol has visited you recently? What might it mean?","In what area of life do you sense the invisible hand guiding you?"],
  warrior: ["What are you protecting right now? Is it sacred or is it fear?","Where are you avoiding the fight that is truly yours to have?"],
  healer:  ["Who or what has needed your healing presence today?","Are you filling your own well as generously as you fill others'?"],
  sage:    ["What truth do you know but have not yet spoken?","Whose path could be illuminated by your hard-earned wisdom?"],
  creator: ["What wants to be made through you that doesn't exist yet?","How would your highest self express creativity today?"],
  default: ["What is alive in you right now that wants your attention?","What are you grateful for that you haven't acknowledged recently?"],
};

export function getDailyReflectionPrompt(spiritualPath: SpiritualPath | "" = ""): string {
  const key = (spiritualPath || "default") as SpiritualPath | "default";
  const pool = REFLECTION_PROMPTS[key] ?? REFLECTION_PROMPTS["default"];
  return pool[Math.floor(Date.now() / 86_400_000) % pool.length];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

export function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function elementEmoji(el: SpiritualElement | ""): string {
  const map: Record<SpiritualElement, string> = { fire: "🔥", earth: "🌍", air: "💨", water: "💧" };
  return el ? map[el] : "✦";
}

export function pathEmoji(path: SpiritualPath | ""): string {
  const map: Record<SpiritualPath, string> = {
    seeker: "🔍", mystic: "🌀", warrior: "⚔️", healer: "💚", sage: "📜", creator: "✨"
  };
  return path ? map[path] : "✦";
}
