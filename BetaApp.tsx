import { Audio } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Alert,
  Easing,
  Image,
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import {
  betaAvatarOptions,
  betaChecklist,
  betaJournalSeed,
  betaMoods,
  betaPulseSeed,
  betaRealmPreviewOrder,
  betaTabs
} from "./src/data/beta";
import {
  realmEnvironments,
  realms,
  spiritualAstrologicalWeather,
  spiritualBirthChart,
  spiritualRuneSet,
  spiritualTarotDeck
} from "./src/data/realms";
import {
  clearContactSyncCache,
  clearKeys,
  createId,
  loadContactSyncState,
  loadJson,
  loadSyncedContacts,
  saveContactSyncState,
  saveJson,
  saveSyncedContacts
} from "./src/storage";
import { createEmptyContactSyncState, syncTrustedContacts } from "./src/features/contacts";
import { colors, radius, shadow, spacing } from "./src/theme";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type {
  BetaProfile,
  BetaTab,
  ContactSyncState,
  JournalEntry,
  PulsePost,
  Realm,
  RealmEnvironment,
  RealmKey,
  SyncedContact,
  UiActionStyle,
  UiAccent,
  UiCorners,
  UiDensity,
  UiPreferences,
  UiSoundPack,
  UiScale,
  UiTransitionSpeed,
  UiTransitionStyle,
  UiStylePreset
} from "./src/types";

const STORAGE_KEYS = {
  profile: "sojournx.beta.profile",
  pulses: "sojournx.beta.pulses",
  journal: "sojournx.beta.journal",
  ui: "sojournx.beta.ui",
  blend: "sojournx.beta.blend"
} as const;

const defaultProfile: BetaProfile = {
  displayName: "",
  handle: "",
  avatar: "X",
  status: "Emerging",
  phoneNumber: "",
  pronouns: "they/them",
  bio: "",
  location: "",
  website: "",
  homeRealm: "anonymous",
  privateMode: true,
  contactsSyncEnabled: false,
  onboardingComplete: false
};

const defaultPulseMood = betaMoods[0];

const defaultUiPreferences: UiPreferences = {
  accent: "crimson",
  style: "vault",
  scale: "balanced",
  density: "balanced",
  corners: "balanced",
  transitionStyle: "slide",
  transitionSpeed: "balanced",
  actionStyle: "balanced",
  soundEnabled: true,
  soundPack: "soft",
  soundVolume: 0.45
};

const publicSiteUrl = "https://sojournx.xyz";

const logoImage = require("./src/assets/sojournx-logo.png");

const accentPalette: Record<UiAccent, { primary: string; glow: string }> = {
  crimson: { primary: "#B00020", glow: "#FF1744" },
  sunset: { primary: "#D9480F", glow: "#FF7A45" },
  emerald: { primary: "#0E9F6E", glow: "#34D399" },
  electric: { primary: "#2563EB", glow: "#60A5FA" },
  amber: { primary: "#B45309", glow: "#F59E0B" }
};

// ─── Social Realm mock data ──────────────────────────────────────────────────

const socialStories = [
  { id: "s1", name: "You", avatar: "X", isOwn: true },
  { id: "s2", name: "Zara", avatar: "Z", isNew: true },
  { id: "s3", name: "Milo", avatar: "M", isNew: true },
  { id: "s4", name: "Reine", avatar: "R", isNew: false },
  { id: "s5", name: "Cleo", avatar: "C", isNew: true }
];

const socialFeedPosts = [
  {
    id: "p1",
    author: "Zara Voss",
    handle: "@zaravoss",
    avatar: "Z",
    time: "2m ago",
    body: "The version of you that stops hiding will be the most powerful thing you've ever released into the world. 🔥",
    likes: 148,
    comments: 32,
    shares: 17,
    realmTag: "Social"
  },
  {
    id: "p2",
    author: "Milo Kane",
    handle: "@milokane",
    avatar: "M",
    time: "18m ago",
    body: "Spent the morning in the Spiritual Realm and now I feel like a completely different person. That meditation vault is everything.",
    likes: 94,
    comments: 21,
    shares: 8,
    realmTag: "Social"
  },
  {
    id: "p3",
    author: "Reine Sol",
    handle: "@reinesol",
    avatar: "R",
    time: "1h ago",
    body: "Hot take: social media should let you choose exactly who sees each part of your identity. SojournX gets it. 👀",
    likes: 212,
    comments: 55,
    shares: 44,
    realmTag: "Social"
  },
  {
    id: "p4",
    author: "Cleo Night",
    handle: "@cleonight",
    avatar: "C",
    time: "3h ago",
    body: "Posted anonymously yesterday and got the most genuine replies I've ever received online. This is what the internet needed.",
    likes: 371,
    comments: 88,
    shares: 62,
    realmTag: "Social"
  }
];

const socialVideos = [
  {
    id: "v1",
    title: "How Identity Shapes Every Scroll You Make",
    channel: "SojournX Studio",
    channelAvatar: "S",
    views: "48K views",
    time: "2 days ago",
    duration: "12:34",
    thumbColor: "#1a0a2e"
  },
  {
    id: "v2",
    title: "Anonymous vs. Visible: Which Mode Serves You?",
    channel: "Vault Sessions",
    channelAvatar: "V",
    views: "21K views",
    time: "5 days ago",
    duration: "8:47",
    thumbColor: "#0a1a2e"
  },
  {
    id: "v3",
    title: "Inside the Growth Realm: A Full Walkthrough",
    channel: "SojournX Studio",
    channelAvatar: "S",
    views: "15K views",
    time: "1 week ago",
    duration: "18:02",
    thumbColor: "#0a2e14"
  },
  {
    id: "v4",
    title: "The Science of Sharing: Privacy & Expression",
    channel: "Mind & Realm",
    channelAvatar: "M",
    views: "9.2K views",
    time: "2 weeks ago",
    duration: "24:15",
    thumbColor: "#2e1a0a"
  }
];

const socialDiscoverTags = [
  "Shadow Thoughts",
  "Growth Confessions",
  "Identity Work",
  "Vault Culture",
  "Reflection Circle",
  "Courage Zone"
];

const socialCircleNames = [
  "Zara Voss",
  "Milo Kane",
  "Reine Sol",
  "Cleo Night",
  "Arlo Price",
  "Sage West"
];

// ─────────────────────────────────────────────────────────────────────────────

const scaleMap: Record<UiScale, number> = {
  compact: 0.9,
  balanced: 1,
  immersive: 1.12
};

const densityMap: Record<UiDensity, number> = {
  cozy: 1.1,
  balanced: 1,
  dense: 0.88
};

const cornerMap: Record<UiCorners, number> = {
  soft: 1.2,
  balanced: 1,
  sharp: 0.7
};

const transitionDurationMap: Record<UiTransitionSpeed, number> = {
  calm: 380,
  balanced: 250,
  snappy: 150
};

const actionScaleMap: Record<UiActionStyle, number> = {
  subtle: 0.99,
  balanced: 0.97,
  bold: 0.94
};

const actionOpacityMap: Record<UiActionStyle, number> = {
  subtle: 0.9,
  balanced: 0.8,
  bold: 0.65
};

const actionSoundLibrary: Record<UiSoundPack, number> = {
  soft: require("./src/assets/sounds/soft-tap.wav"),
  tech: require("./src/assets/sounds/tech-tap.wav"),
  cosmic: require("./src/assets/sounds/cosmic-tap.wav")
};

const realmVisualThemes: Record<RealmKey, { background: string; wash: string; orb: string }> = {
  anonymous: { background: colors.shadowInk, wash: "rgba(139,92,246,0.16)", orb: colors.phantomViolet },
  social: { background: "#0D0B12", wash: "rgba(255,111,97,0.18)", orb: "#EA580C" },
  messaging: { background: "#071015", wash: "rgba(56,189,248,0.17)", orb: colors.phantomBlue },
  marketplace: { background: "#11110A", wash: "rgba(250,204,21,0.16)", orb: "#CA8A04" },
  spiritual: { background: "#0A0E15", wash: "rgba(148,163,255,0.18)", orb: "#6366F1" },
  growth: { background: "#0A120D", wash: "rgba(34,197,94,0.16)", orb: "#16A34A" }
};

type UiRuntime = {
  preferences: UiPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UiPreferences>>;
  blendEnabled: boolean;
  setBlendEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  playUiAction: () => void;
  primaryColor: string;
  glowColor: string;
  scale: number;
  density: number;
  cornerScale: number;
  actionScale: number;
  actionOpacity: number;
  transitionDuration: number;
  activeRealmTheme: { background: string; wash: string; orb: string };
};

const UiRuntimeContext = React.createContext<UiRuntime | null>(null);

function useUiRuntime(): UiRuntime {
  const value = React.useContext(UiRuntimeContext);

  if (!value) {
    return {
      preferences: defaultUiPreferences,
      setPreferences: () => undefined,
      blendEnabled: true,
      setBlendEnabled: () => undefined,
      playUiAction: () => undefined,
      primaryColor: accentPalette.crimson.primary,
      glowColor: accentPalette.crimson.glow,
      scale: 1,
      density: 1,
      cornerScale: 1,
      actionScale: actionScaleMap.balanced,
      actionOpacity: actionOpacityMap.balanced,
      transitionDuration: transitionDurationMap.balanced,
      activeRealmTheme: realmVisualThemes.anonymous
    };
  }

  return value;
}

export default function BetaApp() {
  const tabTransition = React.useRef(new Animated.Value(1)).current;

  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<BetaTab>("Home");
  const [profile, setProfile] = useState<BetaProfile>(defaultProfile);
  const [posts, setPosts] = useState<PulsePost[]>(betaPulseSeed);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(betaJournalSeed);
  const [uiPreferences, setUiPreferences] = useState<UiPreferences>(defaultUiPreferences);
  const [blendEnabled, setBlendEnabled] = useState(true);
  const [selectedRealmKey, setSelectedRealmKey] = useState<RealmKey>(defaultProfile.homeRealm);
  const [syncedContacts, setSyncedContacts] = useState<SyncedContact[]>([]);
  const [contactSyncState, setContactSyncState] = useState<ContactSyncState>(createEmptyContactSyncState());
  const [syncingContacts, setSyncingContacts] = useState(false);
  const [pulseBody, setPulseBody] = useState("");
  const [pulseMood, setPulseMood] = useState(defaultPulseMood);
  const [pulseRealmKey, setPulseRealmKey] = useState<RealmKey>(defaultProfile.homeRealm);
  const [journalBody, setJournalBody] = useState("");
  const [journalMood, setJournalMood] = useState(betaMoods[1]);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      const [storedProfile, storedPosts, storedJournal, storedUi, storedBlend, storedContacts, storedContactState] =
        await Promise.all([
        loadJson<BetaProfile | null>(STORAGE_KEYS.profile, null),
        loadJson<PulsePost[] | null>(STORAGE_KEYS.pulses, null),
        loadJson<JournalEntry[] | null>(STORAGE_KEYS.journal, null),
        loadJson<UiPreferences | null>(STORAGE_KEYS.ui, null),
        loadJson<boolean | null>(STORAGE_KEYS.blend, null),
        loadSyncedContacts(),
        loadContactSyncState(createEmptyContactSyncState())
      ]);

      if (cancelled) {
        return;
      }

      if (storedProfile) {
        setProfile({ ...defaultProfile, ...storedProfile });
        setSelectedRealmKey(storedProfile.homeRealm || defaultProfile.homeRealm);
        setPulseRealmKey(storedProfile.homeRealm || defaultProfile.homeRealm);
      }

      if (storedPosts) {
        setPosts(storedPosts);
      }

      if (storedJournal) {
        setJournalEntries(storedJournal);
      }

      if (storedUi) {
        setUiPreferences({ ...defaultUiPreferences, ...storedUi });
      }

      if (typeof storedBlend === "boolean") {
        setBlendEnabled(storedBlend);
      }

      setSyncedContacts(storedContacts);
      setContactSyncState(storedContactState);

      setHydrated(true);
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    void Promise.all([
      saveJson(STORAGE_KEYS.profile, profile),
      saveJson(STORAGE_KEYS.pulses, posts),
      saveJson(STORAGE_KEYS.journal, journalEntries),
      saveJson(STORAGE_KEYS.ui, uiPreferences),
      saveJson(STORAGE_KEYS.blend, blendEnabled),
      saveSyncedContacts(syncedContacts),
      saveContactSyncState(contactSyncState)
    ]);
  }, [hydrated, profile, posts, journalEntries, uiPreferences, blendEnabled, syncedContacts, contactSyncState]);

  useEffect(() => {
    setPulseRealmKey(profile.homeRealm);
    setSelectedRealmKey(profile.homeRealm);
  }, [profile.homeRealm]);

  const handleContactSync = async () => {
    if (syncingContacts) {
      return;
    }

    if (!profile.contactsSyncEnabled) {
      setSyncedContacts([]);
      setContactSyncState(createEmptyContactSyncState());
      return;
    }

    setSyncingContacts(true);

    try {
      const result = await syncTrustedContacts(true);
      setSyncedContacts(result.contacts);
      setContactSyncState(result.state);
    } finally {
      setSyncingContacts(false);
    }
  };

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (!profile.contactsSyncEnabled) {
      setSyncedContacts([]);
      setContactSyncState(createEmptyContactSyncState());
      return;
    }

    if (!syncingContacts && !contactSyncState.lastSyncedAt) {
      void handleContactSync();
    }
  }, [hydrated, profile.contactsSyncEnabled, contactSyncState.lastSyncedAt]);

  const selectedRealm = useMemo(
    () => realms.find((realm) => realm.key === selectedRealmKey) ?? realms[0],
    [selectedRealmKey]
  );

  const homeRealm = useMemo(
    () => realms.find((realm) => realm.key === profile.homeRealm) ?? realms[0],
    [profile.homeRealm]
  );

  const primaryColor = accentPalette[uiPreferences.accent].primary;
  const glowColor = accentPalette[uiPreferences.accent].glow;
  const uiScale = scaleMap[uiPreferences.scale];
  const density = densityMap[uiPreferences.density];
  const cornerScale = cornerMap[uiPreferences.corners];

  const activeRealmKey: RealmKey =
    activeTab === "Realms"
      ? selectedRealmKey
      : activeTab === "Pulse"
        ? pulseRealmKey
        : profile.homeRealm;

  const activeRealmTheme = realmVisualThemes[activeRealmKey];

  const uiRuntime = useMemo(
    () => ({
      preferences: uiPreferences,
      setPreferences: setUiPreferences,
      blendEnabled,
      setBlendEnabled,
      playUiAction: () => {
        if (!uiPreferences.soundEnabled) {
          return;
        }

        void (async () => {
          try {
            const { sound } = await Audio.Sound.createAsync(
              actionSoundLibrary[uiPreferences.soundPack],
              { shouldPlay: true, volume: uiPreferences.soundVolume }
            );

            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                void sound.unloadAsync();
              }
            });
          } catch {
            return;
          }
        })();
      },
      primaryColor,
      glowColor,
      scale: uiScale,
      density,
      cornerScale,
      actionScale: actionScaleMap[uiPreferences.actionStyle],
      actionOpacity: actionOpacityMap[uiPreferences.actionStyle],
      transitionDuration: transitionDurationMap[uiPreferences.transitionSpeed],
      activeRealmTheme
    }),
    [uiPreferences, blendEnabled, primaryColor, glowColor, uiScale, density, cornerScale, activeRealmTheme]
  );

  useEffect(() => {
    if (!hydrated || !ageConfirmed || !profile.onboardingComplete) {
      return;
    }

    tabTransition.setValue(0);

    Animated.timing(tabTransition, {
      toValue: 1,
      duration: transitionDurationMap[uiPreferences.transitionSpeed],
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start();
  }, [
    activeTab,
    hydrated,
    ageConfirmed,
    profile.onboardingComplete,
    tabTransition,
    uiPreferences.transitionSpeed
  ]);

  const betaMetrics = useMemo(
    () => [
      { label: "Vault Status", value: ageConfirmed ? "Open" : "Locked" },
      { label: "Pulses", value: String(posts.length) },
      { label: "Entries", value: String(journalEntries.length) },
      { label: "Mode", value: profile.privateMode ? "Private" : "Visible" }
    ],
    [ageConfirmed, journalEntries.length, posts.length, profile.privateMode]
  );

  const tabTransitionStyle =
    uiPreferences.transitionStyle === "fade"
      ? { opacity: tabTransition }
      : uiPreferences.transitionStyle === "zoom"
        ? {
            opacity: tabTransition,
            transform: [{ scale: tabTransition.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) }]
          }
        : {
            opacity: tabTransition,
            transform: [
              {
                translateX: tabTransition.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0]
                })
              }
            ]
          };

  let content: React.ReactNode;

  if (!ageConfirmed) {
    content = <AgeGate onEnter={() => setAgeConfirmed(true)} />;
  } else if (!hydrated) {
    content = <LoadingVault />;
  } else if (!profile.onboardingComplete) {
    content = (
      <BetaSetup
        profile={profile}
        setProfile={setProfile}
        onContinue={() => setProfile((current) => ({ ...current, onboardingComplete: true }))}
      />
    );
  } else {
    content = (
      <SafeAreaView style={[styles.safe, { backgroundColor: activeRealmTheme.background }]}>
        <StatusBar barStyle="light-content" />

        <View style={[styles.appShell, { backgroundColor: activeRealmTheme.background }]}> 
          <View style={[styles.realmThemeWash, { backgroundColor: activeRealmTheme.wash }]} />
          <View style={[styles.realmThemeOrb, { backgroundColor: activeRealmTheme.orb }]} />
          <Header profile={profile} />
          <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.content,
              { padding: Math.round(spacing.md * uiScale * density), paddingBottom: Math.round(40 * density) }
            ]}
          >
            <Animated.View style={tabTransitionStyle}>
            {activeTab === "Home" && (
              <HomeScreen
                profile={profile}
                betaMetrics={betaMetrics}
                homeRealm={homeRealm}
                posts={posts}
                journalEntries={journalEntries}
                syncedContacts={syncedContacts}
                contactSyncState={contactSyncState}
                syncingContacts={syncingContacts}
                onSyncContacts={() => void handleContactSync()}
                onJump={(tab) => setActiveTab(tab)}
              />
            )}

          {activeTab === "Pulse" && (
            <PulseScreen
              profile={profile}
              pulseBody={pulseBody}
              setPulseBody={setPulseBody}
              pulseMood={pulseMood}
              setPulseMood={setPulseMood}
              pulseRealmKey={pulseRealmKey}
              setPulseRealmKey={setPulseRealmKey}
              posts={posts}
              onPublish={() => {
                const body = pulseBody.trim();

                if (!body) {
                  Alert.alert("Write a pulse", "Add a few words before broadcasting to the vault.");
                  return;
                }

                const nextPost: PulsePost = {
                  id: createId("pulse"),
                  author: profile.privateMode
                    ? "Anonymous"
                    : `${profile.avatar} ${profile.displayName || profile.handle || "Vault Member"}`,
                  realmKey: pulseRealmKey,
                  mood: pulseMood,
                  body,
                  createdAt: new Date().toISOString(),
                  replies: 0
                };

                setPosts((current) => [nextPost, ...current]);
                setPulseBody("");
              }}
            />
          )}

            {activeTab === "Realms" && (
              <RealmsScreen
                profile={profile}
                selectedRealm={selectedRealm}
                environment={realmEnvironments[selectedRealm.key]}
                syncedContacts={syncedContacts}
                contactSyncState={contactSyncState}
                syncingContacts={syncingContacts}
                onSyncContacts={() => void handleContactSync()}
                setSelectedRealmKey={setSelectedRealmKey}
                onMakeHome={(realmKey) => setProfile((current) => ({ ...current, homeRealm: realmKey }))}
              />
            )}

          {activeTab === "Journal" && (
            <JournalScreen
              journalEntries={journalEntries}
              journalBody={journalBody}
              setJournalBody={setJournalBody}
              journalMood={journalMood}
              setJournalMood={setJournalMood}
              onSave={() => {
                const reflection = journalBody.trim();

                if (!reflection) {
                  Alert.alert("Write a reflection", "Add a thought before saving the journal entry.");
                  return;
                }

                const nextEntry: JournalEntry = {
                  id: createId("journal"),
                  mood: journalMood,
                  reflection,
                  createdAt: new Date().toISOString()
                };

                setJournalEntries((current) => [nextEntry, ...current]);
                setJournalBody("");
              }}
            />
          )}

            {activeTab === "Profile" && (
              <ProfileScreen
                profile={profile}
                setProfile={setProfile}
                posts={posts}
                entries={journalEntries}
                syncedContacts={syncedContacts}
                contactSyncState={contactSyncState}
                syncingContacts={syncingContacts}
                onSyncContacts={() => void handleContactSync()}
              />
            )}

            {activeTab === "Settings" && (
              <SettingsScreen
                profile={profile}
                setProfile={setProfile}
                contactSyncState={contactSyncState}
                syncingContacts={syncingContacts}
                onSyncContacts={() => void handleContactSync()}
                onReset={() => {
                Alert.alert(
                  "Reset local vault?",
                  "This clears the beta profile, pulse feed, journal, and synced contacts from this device.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset",
                      style: "destructive",
                      onPress: async () => {
                        await clearKeys([
                          STORAGE_KEYS.profile,
                          STORAGE_KEYS.pulses,
                          STORAGE_KEYS.journal,
                          STORAGE_KEYS.ui,
                          STORAGE_KEYS.blend
                        ]);
                        await clearContactSyncCache();
                        setProfile(defaultProfile);
                        setPosts(betaPulseSeed);
                        setJournalEntries(betaJournalSeed);
                        setUiPreferences(defaultUiPreferences);
                        setBlendEnabled(true);
                        setSyncedContacts([]);
                        setContactSyncState(createEmptyContactSyncState());
                        setSyncingContacts(false);
                        setActiveTab("Home");
                        setSelectedRealmKey(defaultProfile.homeRealm);
                        setPulseRealmKey(defaultProfile.homeRealm);
                        setPulseMood(defaultPulseMood);
                        setJournalMood(betaMoods[1]);
                        setPulseBody("");
                        setJournalBody("");
                        setAgeConfirmed(false);
                        setHydrated(true);
                      }
                    }
                  ]
                  );
                }}
              />
            )}
            </Animated.View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <UiRuntimeContext.Provider value={uiRuntime}>
      {content}
      {Platform.OS === "web" && (
        <>
          <Analytics />
          <SpeedInsights />
        </>
      )}
    </UiRuntimeContext.Provider>
  );
}

function AgeGate({ onEnter }: { onEnter: () => void }) {
  const ui = useUiRuntime();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.vaultBlack }]}>
      <View style={styles.ageGate}>
        <View style={[styles.glowOrb, { backgroundColor: ui.primaryColor }]} />
        <Image source={logoImage} style={[styles.logoImage, { borderColor: ui.glowColor }]} />
        <Text style={styles.title}>SojournX Beta</Text>
        <Text style={styles.tagline}>Every version of you has a realm.</Text>

        <View style={styles.ageCard}>
          <Text style={styles.ageTitle}>Enter the Vault</Text>
          <Text style={styles.bodyText}>
            SojournX Beta is an adults-only digital sanctuary for private identity, expression,
            reflection, and connection.
          </Text>
          <Text style={styles.disclaimer}>
            By entering, you confirm that you are 18+ and agree to use the platform respectfully.
          </Text>

          <PrimaryButton label="I am 18+ - Enter SojournX" onPress={onEnter} />
        </View>

        <Text style={styles.footerNote}>
          Beta build. Profile, pulse feed, and journal data are stored locally on this device.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function LoadingVault() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.vaultBlack }]}>
      <View style={styles.loadingWrap}>
        <Text style={styles.loadingKicker}>VAULT BOOTING</Text>
        <Text style={styles.loadingTitle}>Loading your beta state...</Text>
      </View>
    </SafeAreaView>
  );
}

function BetaSetup({
  profile,
  setProfile,
  onContinue
}: {
  profile: BetaProfile;
  setProfile: React.Dispatch<React.SetStateAction<BetaProfile>>;
  onContinue: () => void;
}) {
  const ui = useUiRuntime();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.vaultBlack }]}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            padding: Math.round(spacing.md * ui.scale * ui.density),
            paddingBottom: Math.round(40 * ui.density)
          }
        ]}
      >
        <View style={[styles.heroCard, shadow, { borderColor: ui.primaryColor }]}> 
          <Text style={styles.heroEyebrow}>BETA SETUP</Text>
          <Text style={styles.heroTitle}>Shape the first true vault identity.</Text>
          <Text style={styles.heroBody}>
            This profile stays local to your device and unlocks the beta experience.
          </Text>
        </View>

        <ContentCard>
          <FieldLabel label="Avatar" helper="Choose a symbol that represents your current identity." />
          <SelectionRow<string>
            items={betaAvatarOptions.map((avatar) => ({ key: avatar, label: avatar }))}
            value={profile.avatar}
            onSelect={(avatar) => setProfile((current) => ({ ...current, avatar }))}
          />

          <FieldLabel label="Display Name" helper="How your profile is shown throughout the app." />
          <InputField
            value={profile.displayName}
            onChangeText={(displayName) => setProfile((current) => ({ ...current, displayName }))}
            placeholder="Astra Vale"
          />

          <FieldLabel label="Handle" helper="How the beta will address you." />
          <InputField
            value={profile.handle}
            onChangeText={(handle) => setProfile((current) => ({ ...current, handle }))}
            placeholder="Your vault name"
          />

          <FieldLabel label="Pronouns" helper="Optional identity signal." />
          <InputField
            value={profile.pronouns}
            onChangeText={(pronouns) => setProfile((current) => ({ ...current, pronouns }))}
            placeholder="they/them"
          />

          <FieldLabel label="Bio" helper="One line that defines the current version of you." />
          <InputField
            value={profile.bio}
            onChangeText={(bio) => setProfile((current) => ({ ...current, bio }))}
            placeholder="Testing the vault"
            multiline
          />
        </ContentCard>

        <ContentCard>
          <FieldLabel label="Home Realm" helper="Your default realm when the app opens." />
          <RealmChipRow
            realmsToShow={betaRealmPreviewOrder}
            activeRealmKey={profile.homeRealm}
            onSelect={(homeRealm) => setProfile((current) => ({ ...current, homeRealm }))}
          />

          <FieldLabel label="Private Mode" helper="Hide your handle on posted pulses." />
          <ToggleRow
            label={profile.privateMode ? "Private" : "Visible"}
            description={profile.privateMode ? "Posts are anonymized." : "Posts show your handle."}
            value={profile.privateMode}
            onValueChange={(privateMode) => setProfile((current) => ({ ...current, privateMode }))}
          />
        </ContentCard>

        <PrimaryButton label="Enter Beta Vault" onPress={onContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ profile }: { profile: BetaProfile }) {
  const ui = useUiRuntime();

  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>SojournX Beta</Text>
        <Text style={styles.headerSub}>
          {(profile.displayName || profile.handle || "Vault member") + " · Local-first multi-realm identity platform"}
        </Text>
      </View>

      <View style={[styles.headerRight]}>
        <View style={[styles.profileAvatarMini, { backgroundColor: ui.primaryColor }]}>
          <Text style={styles.profileAvatarMiniText}>{profile.avatar || "X"}</Text>
        </View>
        <View style={[styles.vaultBadge, { borderColor: ui.glowColor, backgroundColor: ui.primaryColor }]}> 
          <Text style={styles.vaultBadgeText}>{profile.privateMode ? "PRIVATE" : "OPEN"}</Text>
        </View>
      </View>
    </View>
  );
}

function Nav({
  activeTab,
  setActiveTab
}: {
  activeTab: BetaTab;
  setActiveTab: (tab: BetaTab) => void;
}) {
  const ui = useUiRuntime();

  return (
    <View style={styles.nav}>
      {betaTabs.map((tab) => {
        const active = tab === activeTab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => {
              ui.playUiAction();
              setActiveTab(tab);
            }}
            activeOpacity={ui.actionOpacity}
            style={[
              styles.navItem,
              active && styles.navItemActive,
              active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
            ]}
          >
            <Text style={[styles.navText, active && styles.navTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function HomeScreen({
  profile,
  betaMetrics,
  homeRealm,
  posts,
  journalEntries,
  syncedContacts,
  contactSyncState,
  syncingContacts,
  onSyncContacts,
  onJump
}: {
  profile: BetaProfile;
  betaMetrics: Array<{ label: string; value: string }>;
  homeRealm: Realm;
  posts: PulsePost[];
  journalEntries: JournalEntry[];
  syncedContacts: SyncedContact[];
  contactSyncState: ContactSyncState;
  syncingContacts: boolean;
  onSyncContacts: () => void;
  onJump: (tab: BetaTab) => void;
}) {
  const recentPulse = posts[0];
  const recentEntry = journalEntries[0];

  return (
    <View>
      <View style={[styles.heroCard, shadow]}>
        <Text style={styles.heroEyebrow}>BETA HOME</Text>
        <Text style={styles.heroTitle}>
          Welcome back, {profile.displayName || profile.handle || "Vault member"}.
        </Text>
        <Text style={styles.heroBody}>
          Your default realm is {homeRealm.title}. The local beta now remembers your identity,
          pulse feed, and journal on this device.
        </Text>

        <View style={styles.heroPills}>
          <Pill label={profile.privateMode ? "Private posts" : "Visible posts"} />
          <Pill label={`${posts.length} pulses`} />
          <Pill label={`${journalEntries.length} journal entries`} />
        </View>
      </View>

      <SectionTitle title="Beta Signals" subtitle="The first true release needs visible proof of continuity." />

      <View style={styles.metricGrid}>
        {betaMetrics.map((metric) => (
          <MetricCard key={metric.label} label={metric.label} value={metric.value} />
        ))}
      </View>

      <SectionTitle title="Launch Lane" subtitle="Use the beta to move through each realm intentionally." />

      <View style={styles.launchRow}>
        <LaunchButton label="Pulse" hint="Broadcast a thought" onPress={() => onJump("Pulse")} />
        <LaunchButton label="Journal" hint="Capture an insight" onPress={() => onJump("Journal")} />
      </View>

      <SectionTitle title="Ghost Circle" subtitle="Signal-like contact sync for the people you trust most." />

      <ContactSyncCard
        profile={profile}
        contactSyncState={contactSyncState}
        syncedContacts={syncedContacts}
        syncingContacts={syncingContacts}
        onSyncContacts={onSyncContacts}
      />

      <SectionTitle title="Vault Checklist" subtitle="Proof that the beta is actually doing work." />

      {betaChecklist.map((item) => (
        <ChecklistCard key={item.title} title={item.title} detail={item.detail} />
      ))}

      {recentPulse && (
        <ContentCard>
          <Text style={styles.cardKicker}>RECENT PULSE</Text>
          <Text style={styles.cardTitle}>{recentPulse.body}</Text>
          <Text style={styles.cardMeta}>
            {recentPulse.author} · {recentPulse.mood} · {formatRelativeTime(recentPulse.createdAt)}
          </Text>
        </ContentCard>
      )}

      {recentEntry && (
        <ContentCard>
          <Text style={styles.cardKicker}>RECENT JOURNAL</Text>
          <Text style={styles.cardTitle}>{recentEntry.mood}</Text>
          <Text style={styles.bodyText}>{recentEntry.reflection}</Text>
          <Text style={styles.cardMeta}>{formatRelativeTime(recentEntry.createdAt)}</Text>
        </ContentCard>
      )}
    </View>
  );
}

function PulseScreen({
  profile,
  pulseBody,
  setPulseBody,
  pulseMood,
  setPulseMood,
  pulseRealmKey,
  setPulseRealmKey,
  posts,
  onPublish
}: {
  profile: BetaProfile;
  pulseBody: string;
  setPulseBody: React.Dispatch<React.SetStateAction<string>>;
  pulseMood: string;
  setPulseMood: React.Dispatch<React.SetStateAction<string>>;
  pulseRealmKey: RealmKey;
  setPulseRealmKey: React.Dispatch<React.SetStateAction<RealmKey>>;
  posts: PulsePost[];
  onPublish: () => void;
}) {
  return (
    <View>
      <SectionTitle title="Pulse Feed" subtitle="Post into the vault without performing for the crowd." />

      <ContentCard>
        <FieldLabel label="What do you want to say?" helper="Short, honest, and contained." />
        <InputField
          value={pulseBody}
          onChangeText={setPulseBody}
          placeholder="Write your pulse here"
          multiline
        />

        <FieldLabel label="Mood" helper="How the pulse should feel." />
        <MoodRow moods={betaMoods} activeMood={pulseMood} onSelect={setPulseMood} />

        <FieldLabel label="Realm" helper="Where this pulse belongs." />
        <RealmChipRow
          activeRealmKey={pulseRealmKey}
          onSelect={setPulseRealmKey}
          realmsToShow={betaRealmPreviewOrder}
        />

        <PrimaryButton label="Broadcast to Vault" onPress={onPublish} />

        <Text style={styles.helperNote}>
          {profile.privateMode ? "Your handle stays hidden." : `Posting as ${profile.handle || "Vault member"}.`}
        </Text>
      </ContentCard>

      <SectionTitle title="Live Feed" subtitle="Seeded posts plus whatever you publish next." />

      {posts.map((post) => (
        <PulseCard key={post.id} post={post} />
      ))}
    </View>
  );
}

const mktCategories = ["All", "Digital", "Physical", "Services", "Curated", "Local"] as const;
type MktCategory = (typeof mktCategories)[number];

const mktFeaturedListing = {
  id: "featured-1",
  icon: "🎨",
  title: "Vault Art Bundle — 12 Exclusive Prints",
  price: "$40 – $120",
  description:
    "A curated collection of dark-aesthetic digital prints for your vault space. One-time purchase, no tracking.",
  seller: "Vault Seller #07",
  category: "Digital" as MktCategory,
  anonPurchase: true
};

const mktListings = [
  {
    id: "listing-1",
    icon: "🖥️",
    title: "Dark UI Component Kit",
    price: "$18",
    seller: "Vault Seller #42",
    category: "Digital" as MktCategory,
    likes: 34
  },
  {
    id: "listing-2",
    icon: "📿",
    title: "Handcrafted Obsidian Bracelet",
    price: "$55",
    seller: "Vault Seller #91",
    category: "Physical" as MktCategory,
    likes: 19
  },
  {
    id: "listing-3",
    icon: "🔮",
    title: "Anonymous Identity Consultation",
    price: "$75/hr",
    seller: "Vault Seller #13",
    category: "Services" as MktCategory,
    likes: 27
  },
  {
    id: "listing-4",
    icon: "📖",
    title: "Encrypted Journal Template Pack",
    price: "$12",
    seller: "Vault Seller #58",
    category: "Digital" as MktCategory,
    likes: 41
  },
  {
    id: "listing-5",
    icon: "🌿",
    title: "Local Herbalist Drop Box — Monthly",
    price: "$30/mo",
    seller: "Vault Seller #03",
    category: "Local" as MktCategory,
    likes: 11
  },
  {
    id: "listing-6",
    icon: "🎧",
    title: "Curated Vault Soundscape Vol. 3",
    price: "$9",
    seller: "Vault Seller #77",
    category: "Curated" as MktCategory,
    likes: 62
  }
];

function MarketplaceRealmView({
  profile,
  onMakeHome
}: {
  profile: BetaProfile;
  onMakeHome: (realmKey: RealmKey) => void;
}) {
  const ui = useUiRuntime();
  const [activeCategory, setActiveCategory] = useState<MktCategory>("All");
  const [anonOnly, setAnonOnly] = useState(false);
  const [likedIds, setLikedIds] = useState<string[]>([]);

  const visibleListings = mktListings.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const toggleLike = (id: string) => {
    ui.playUiAction();
    setLikedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <View>
      <SectionTitle title="Marketplace Realm" subtitle="Privacy-first buying and selling. No real names required." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mktChipRow}>
        {mktCategories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <TouchableOpacity
              key={cat}
              activeOpacity={ui.actionOpacity}
              onPress={() => {
                ui.playUiAction();
                setActiveCategory(cat);
              }}
              style={[
                styles.mktFilterChip,
                active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
              ]}
            >
              <Text style={[styles.mktFilterChipText, active && { color: colors.boneWhite }]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.mktActiveFilters}>
        <View style={[styles.mktFilterChip, { borderColor: ui.primaryColor }]}>
          <Text style={[styles.mktFilterChipText, { color: colors.boneWhite }]}>$0 – $200</Text>
        </View>
        <View style={[styles.mktFilterChip, { borderColor: ui.primaryColor }]}>
          <Text style={[styles.mktFilterChipText, { color: colors.boneWhite }]}>{activeCategory}</Text>
        </View>
        <View style={styles.mktAnonToggleRow}>
          <Text style={styles.mktAnonToggleLabel}>Anon Only</Text>
          <Switch
            value={anonOnly}
            onValueChange={(value) => {
              ui.playUiAction();
              setAnonOnly(value);
            }}
            trackColor={{ false: colors.borderBlack, true: ui.primaryColor }}
            thumbColor={anonOnly ? ui.glowColor : colors.mutedGray}
          />
        </View>
      </View>

      <View style={[styles.mktHeroCard, { borderColor: ui.primaryColor }]}>
        <View style={styles.mktHeroBadgeRow}>
          <View style={[styles.mktAnonBadge, { backgroundColor: ui.primaryColor }]}>
            <Text style={styles.mktAnonBadgeText}>🔒 Anon Purchase</Text>
          </View>
          <Text style={[styles.mktCategoryTag, { color: ui.glowColor }]}>{mktFeaturedListing.category}</Text>
        </View>
        <Text style={styles.mktHeroIcon}>{mktFeaturedListing.icon}</Text>
        <Text style={styles.mktHeroTitle}>{mktFeaturedListing.title}</Text>
        <Text style={[styles.mktHeroPrice, { color: ui.glowColor }]}>{mktFeaturedListing.price}</Text>
        <Text style={styles.mktHeroDesc}>{mktFeaturedListing.description}</Text>
        <Text style={styles.mktSellerTag}>{mktFeaturedListing.seller}</Text>
        <TouchableOpacity
          activeOpacity={ui.actionOpacity}
          onPress={ui.playUiAction}
          style={[styles.mktCtaButton, { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}
        >
          <Text style={styles.mktCtaButtonText}>View Listing</Text>
        </TouchableOpacity>
      </View>

      <ContentCard>
        <Text style={styles.cardKicker}>POST A LISTING</Text>
        <View style={styles.mktComposerRow}>
          <View style={[styles.mktComposerAvatar, { backgroundColor: ui.primaryColor }]}>
            <Text style={styles.mktComposerAvatarText}>{profile.avatar || "V"}</Text>
          </View>
          <View style={styles.mktComposerInput}>
            <Text style={styles.mktComposerPlaceholder}>What are you offering?</Text>
          </View>
        </View>
        <View style={styles.mktComposerChips}>
          {["📷 Photo", "🏷️ Category", "💰 Price"].map((label) => (
            <TouchableOpacity
              key={label}
              activeOpacity={ui.actionOpacity}
              onPress={ui.playUiAction}
              style={[styles.mktFilterChip, { borderColor: ui.primaryColor }]}
            >
              <Text style={[styles.mktFilterChipText, { color: colors.boneWhite }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ContentCard>

      <SectionTitle title="Browse Listings" subtitle="All sellers are vault-anonymized by default." />
      <View style={styles.mktListingGrid}>
        {visibleListings.map((item) => {
          const liked = likedIds.includes(item.id);
          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={ui.actionOpacity}
              onPress={ui.playUiAction}
              style={[styles.mktListingCard, { borderColor: colors.borderBlack }]}
            >
              <Text style={styles.mktListingIcon}>{item.icon}</Text>
              <Text style={styles.mktListingTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={[styles.mktListingPrice, { color: ui.glowColor }]}>{item.price}</Text>
              <Text style={styles.mktListingSeller}>{item.seller}</Text>
              <View style={styles.mktListingActions}>
                <TouchableOpacity
                  activeOpacity={ui.actionOpacity}
                  onPress={() => toggleLike(item.id)}
                  style={styles.mktLikeButton}
                >
                  <Text style={[styles.mktLikeText, liked && { color: ui.glowColor }]}>
                    {liked ? "♥" : "♡"} {item.likes + (liked ? 1 : 0)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={ui.actionOpacity} onPress={ui.playUiAction} style={styles.mktLikeButton}>
                  <Text style={styles.mktLikeText}>🔖</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.secondaryButton, profile.homeRealm === "marketplace" && styles.secondaryButtonDisabled]}
        onPress={() => {
          ui.playUiAction();
          onMakeHome("marketplace");
        }}
      >
        <Text style={styles.secondaryButtonText}>
          {profile.homeRealm === "marketplace" ? "Home realm selected" : "Make home realm"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Social Realm ─────────────────────────────────────────────────────────────

type SocialTab = "Feed" | "Videos" | "Friends" | "Discover";

function SocialStoryBubble({
  name,
  avatar,
  isOwn,
  isNew,
  primaryColor
}: {
  name: string;
  avatar: string;
  isOwn?: boolean;
  isNew?: boolean;
  primaryColor: string;
}) {
  return (
    <View style={styles.socialStoryWrap}>
      <View
        style={[
          styles.socialStoryRing,
          { borderColor: isNew ? primaryColor : colors.borderBlack }
        ]}
      >
        <View style={[styles.socialStoryAvatar, { backgroundColor: isOwn ? colors.sojournRed : colors.deepBlack }]}>
          {isOwn ? (
            <Text style={styles.socialStoryAvatarAdd}>+</Text>
          ) : (
            <Text style={styles.socialStoryAvatarText}>{avatar}</Text>
          )}
        </View>
      </View>
      <Text style={styles.socialStoryName} numberOfLines={1}>{name}</Text>
    </View>
  );
}

function SocialFeedPost({
  post,
  primaryColor,
  glowColor
}: {
  post: (typeof socialFeedPosts)[number];
  primaryColor: string;
  glowColor: string;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={styles.socialPost}>
      {/* Post header */}
      <View style={styles.socialPostHeader}>
        <View style={[styles.socialPostAvatar, { backgroundColor: colors.deepBlack, borderColor: primaryColor }]}>
          <Text style={[styles.socialPostAvatarText, { color: glowColor }]}>{post.avatar}</Text>
        </View>
        <View style={styles.socialPostMeta}>
          <Text style={styles.socialPostAuthor}>{post.author}</Text>
          <Text style={styles.socialPostHandle}>{post.handle} · {post.time}</Text>
        </View>
        <View style={[styles.socialPostBadge, { borderColor: primaryColor }]}>
          <Text style={[styles.socialPostBadgeText, { color: glowColor }]}>{post.realmTag}</Text>
        </View>
      </View>

      {/* Body */}
      <Text style={styles.socialPostBody}>{post.body}</Text>

      {/* Divider */}
      <View style={styles.socialPostDivider} />

      {/* Actions */}
      <View style={styles.socialPostActions}>
        <TouchableOpacity
          style={styles.socialPostAction}
          onPress={() => setLiked((v) => !v)}
          activeOpacity={0.7}
        >
          <Text style={[styles.socialPostActionIcon, liked && { color: glowColor }]}>
            {liked ? "♥" : "♡"}
          </Text>
          <Text style={[styles.socialPostActionText, liked && { color: glowColor }]}>
            {liked ? post.likes + 1 : post.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialPostAction} activeOpacity={0.7}>
          <Text style={styles.socialPostActionIcon}>💬</Text>
          <Text style={styles.socialPostActionText}>{post.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialPostAction} activeOpacity={0.7}>
          <Text style={styles.socialPostActionIcon}>↗</Text>
          <Text style={styles.socialPostActionText}>{post.shares}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SocialVideoCard({
  video,
  primaryColor,
  glowColor
}: {
  video: (typeof socialVideos)[number];
  primaryColor: string;
  glowColor: string;
}) {
  return (
    <View style={styles.socialVideoCard}>
      {/* Thumbnail */}
      <View style={[styles.socialVideoThumb, { backgroundColor: video.thumbColor }]}>
        <Text style={styles.socialVideoThumbPlay}>▶</Text>
        <View style={[styles.socialVideoDuration, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
          <Text style={styles.socialVideoDurationText}>{video.duration}</Text>
        </View>
      </View>

      {/* Info row */}
      <View style={styles.socialVideoInfo}>
        <View style={[styles.socialVideoChannelAvatar, { backgroundColor: colors.deepBlack, borderColor: primaryColor }]}>
          <Text style={[styles.socialVideoChannelAvatarText, { color: glowColor }]}>{video.channelAvatar}</Text>
        </View>
        <View style={styles.socialVideoText}>
          <Text style={styles.socialVideoTitle} numberOfLines={2}>{video.title}</Text>
          <Text style={styles.socialVideoMeta}>{video.channel}</Text>
          <Text style={styles.socialVideoMeta}>{video.views} · {video.time}</Text>
        </View>
      </View>
    </View>
  );
}

function SocialRealmScreen({
  profile,
  onMakeHome
}: {
  profile: BetaProfile;
  onMakeHome: (realmKey: RealmKey) => void;
}) {
  const ui = useUiRuntime();
  const [socialTab, setSocialTab] = useState<SocialTab>("Feed");
  const socialTabs: SocialTab[] = ["Feed", "Videos", "Friends", "Discover"];

  return (
    <View>
      {/* Social Realm header */}
      <View style={styles.socialHeader}>
        <View>
          <Text style={[styles.socialHeaderTitle, { color: colors.boneWhite }]}>Social Realm</Text>
          <Text style={[styles.socialHeaderSub, { color: ui.glowColor }]}>◆ Be seen only when you choose.</Text>
        </View>
        <View style={[styles.socialHeaderBadge, { backgroundColor: ui.primaryColor }]}>
          <Text style={styles.socialHeaderBadgeText}>LIVE</Text>
        </View>
      </View>

      {/* Stories bar */}
      <View style={styles.socialStoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.socialStoriesScroll}>
          {socialStories.map((s) => (
            <SocialStoryBubble
              key={s.id}
              name={s.name}
              avatar={s.avatar}
              isOwn={s.isOwn}
              isNew={s.isNew}
              primaryColor={ui.primaryColor}
            />
          ))}
        </ScrollView>
      </View>

      {/* Create post bar */}
      <View style={[styles.socialCreateBar, { borderColor: colors.borderBlack }]}>
        <View style={[styles.socialCreateAvatar, { backgroundColor: ui.primaryColor }]}>
          <Text style={styles.socialCreateAvatarText}>{profile.avatar}</Text>
        </View>
        <View style={[styles.socialCreateInput, { borderColor: colors.borderBlack }]}>
          <Text style={{ color: colors.mutedGray, fontSize: 14 }}>
            {profile.displayName
              ? `What's on your mind, ${profile.displayName.split(" ")[0]}?`
              : "Share something with your circle…"}
          </Text>
        </View>
      </View>

      {/* Inner tab bar */}
      <View style={styles.socialTabBar}>
        {socialTabs.map((tab) => {
          const active = tab === socialTab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSocialTab(tab)}
              activeOpacity={0.75}
              style={[
                styles.socialTabItem,
                active && { borderBottomColor: ui.glowColor }
              ]}
            >
              <Text style={[styles.socialTabText, active && { color: ui.glowColor }]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feed */}
      {socialTab === "Feed" && (
        <View>
          {socialFeedPosts.map((post) => (
            <SocialFeedPost key={post.id} post={post} primaryColor={ui.primaryColor} glowColor={ui.glowColor} />
          ))}
        </View>
      )}

      {/* Videos */}
      {socialTab === "Videos" && (
        <View>
          <View style={styles.socialVideoHeader}>
            <Text style={styles.socialVideoHeaderTitle}>Trending in the Vault</Text>
            <Text style={styles.socialVideoHeaderSub}>Curated video from across the realms</Text>
          </View>
          {socialVideos.map((video) => (
            <SocialVideoCard key={video.id} video={video} primaryColor={ui.primaryColor} glowColor={ui.glowColor} />
          ))}
        </View>
      )}

      {/* Friends */}
      {socialTab === "Friends" && (
        <ContentCard>
          <Text style={styles.cardKicker}>CIRCLE GRAPH</Text>
          <Text style={styles.cardTitle}>Your Trust Circles</Text>
          <Text style={styles.bodyText}>Friends and followers sorted by trust tier and circle role. Selective reach means only the right people see each layer of you.</Text>
          <View style={[styles.socialFriendGrid]}>
            {socialCircleNames.map((name) => (
              <View key={name} style={[styles.socialFriendChip, { borderColor: ui.primaryColor }]}>
                <View style={[styles.socialFriendAvatar, { backgroundColor: ui.primaryColor }]}>
                  <Text style={styles.socialFriendAvatarText}>{name[0]}</Text>
                </View>
                <Text style={styles.socialFriendName} numberOfLines={1}>{name}</Text>
                <Text style={[styles.socialFriendStatus, { color: ui.glowColor }]}>● Active</Text>
              </View>
            ))}
          </View>
        </ContentCard>
      )}

      {/* Discover */}
      {socialTab === "Discover" && (
        <ContentCard>
          <Text style={styles.cardKicker}>DISCOVERY LAYER</Text>
          <Text style={styles.cardTitle}>Find Your People</Text>
          <Text style={styles.bodyText}>Browse realm communities, follow creators, and discover circles aligned with your identity — without the noise of algorithmic feeds.</Text>
          <View style={[styles.socialDiscoverTagWrap]}>
            {socialDiscoverTags.map((tag) => (
              <TouchableOpacity key={tag} style={[styles.socialDiscoverTag, { borderColor: ui.primaryColor }]} activeOpacity={0.75}>
                <Text style={[styles.socialDiscoverTagText, { color: ui.glowColor }]}># {tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ContentCard>
      )}

      {/* Make home realm */}
      <TouchableOpacity
        style={[styles.secondaryButton, profile.homeRealm === "social" && styles.secondaryButtonDisabled, { marginTop: 8 }]}
        onPress={() => onMakeHome("social")}
        activeOpacity={0.8}
      >
        <Text style={styles.secondaryButtonText}>
          {profile.homeRealm === "social" ? "Social is your home realm" : "Make Social your home realm"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function RealmsScreen({
  profile,
  selectedRealm,
  environment,
  syncedContacts,
  contactSyncState,
  syncingContacts,
  onSyncContacts,
  setSelectedRealmKey,
  onMakeHome
}: {
  profile: BetaProfile;
  selectedRealm: Realm;
  environment: RealmEnvironment;
  syncedContacts: SyncedContact[];
  contactSyncState: ContactSyncState;
  syncingContacts: boolean;
  onSyncContacts: () => void;
  setSelectedRealmKey: React.Dispatch<React.SetStateAction<RealmKey>>;
  onMakeHome: (realmKey: RealmKey) => void;
}) {
  const ui = useUiRuntime();

  return (
    <View>
      <SectionTitle title="The SojournX Realms" subtitle="Each realm is a different mode of being." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.realmSelector}>
        {realms.map((realm) => {
          const active = selectedRealm.key === realm.key;

          return (
            <TouchableOpacity
              key={realm.key}
              onPress={() => setSelectedRealmKey(realm.key)}
              style={[
                styles.realmChip,
                active && styles.realmChipActive,
                active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
              ]}
            >
              <Text style={[styles.realmIcon, { color: ui.glowColor }]}>{realm.icon}</Text>
              <Text style={[styles.realmChipText, active && styles.realmChipTextActive]}>
                {realm.shortTitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {selectedRealm.key === "marketplace" ? (
        <MarketplaceRealmView profile={profile} onMakeHome={onMakeHome} />
      ) : selectedRealm.key === "social" ? (
        <SocialRealmScreen profile={profile} onMakeHome={onMakeHome} />
      ) : (
        <>
          <View style={[styles.realmDetail, shadow, { borderColor: ui.primaryColor }]}>
            <Text style={[styles.realmDetailIcon, { color: ui.glowColor }]}>{selectedRealm.icon}</Text>
            <Text style={styles.realmDetailTitle}>{selectedRealm.title}</Text>
            <Text style={[styles.realmPromise, { color: ui.glowColor }]}>{selectedRealm.promise}</Text>
            <Text style={styles.bodyText}>{selectedRealm.description}</Text>

            <ContentCard>
              <Text style={styles.cardKicker}>ENVIRONMENT MISSION</Text>
              <Text style={styles.cardTitle}>{environment.mission}</Text>
              <Text style={styles.bodyText}>{environment.atmosphere}</Text>
            </ContentCard>

            {selectedRealm.key === "anonymous" && (
              <ContactSyncCard
                profile={profile}
                contactSyncState={contactSyncState}
                syncedContacts={syncedContacts}
                syncingContacts={syncingContacts}
                onSyncContacts={onSyncContacts}
                title="Veiled Contacts"
                kicker="ANONYMITY UPGRADE"
                subtitle="Keep your trusted circle close without exposing a public graph."
              />
            )}

            <SectionTitle
              title="Environment Modules"
              subtitle="Each realm ships with a complete operating environment, not just a single feed."
            />

            {environment.modules.map((module) => (
              <ContentCard key={module.name}>
                <Text style={styles.cardKicker}>MODULE</Text>
                <Text style={styles.cardTitle}>{module.name}</Text>
                <Text style={styles.bodyText}>{module.description}</Text>
                <View style={styles.featureList}>
                  {module.capabilities.map((capability) => (
                    <View key={capability} style={styles.featureRow}>
                      <Text style={[styles.featureBullet, { color: ui.glowColor }]}>◆</Text>
                      <Text style={styles.featureText}>{capability}</Text>
                    </View>
                  ))}
                </View>
              </ContentCard>
            ))}

            <ContentCard>
              <Text style={styles.cardKicker}>SEAMLESS BLEND PATHS</Text>
              <Text style={styles.bodyText}>
                {ui.blendEnabled
                  ? "Cross-realm transitions are active. Modules can hand off context into connected realms."
                  : "Cross-realm transitions are paused. Realms currently operate in isolated mode."}
              </Text>
              <View style={styles.realmChipWrap}>
                {environment.blendTargets.map((targetKey) => {
                  const target = realms.find((realm) => realm.key === targetKey) ?? realms[0];

                  return (
                    <View key={target.key} style={[styles.realmChip, { borderColor: ui.primaryColor }]}>
                      <Text style={[styles.realmChipText, { color: colors.boneWhite }]}>{target.shortTitle}</Text>
                    </View>
                  );
                })}
              </View>
            </ContentCard>

            {selectedRealm.key === "spiritual" && <SpiritualOracleSuite />}

            <View style={styles.featureList}>
              {selectedRealm.features.map((feature) => (
                <View key={feature} style={styles.featureRow}>
                  <Text style={styles.featureBullet}>◆</Text>
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.secondaryButton, profile.homeRealm === selectedRealm.key && styles.secondaryButtonDisabled]}
              onPress={() => onMakeHome(selectedRealm.key)}
            >
              <Text style={styles.secondaryButtonText}>
                {profile.homeRealm === selectedRealm.key ? "Home realm selected" : "Make home realm"}
              </Text>
            </TouchableOpacity>
          </View>

          <ContentCard>
            <Text style={styles.cardKicker}>CATEGORY</Text>
            <Text style={styles.cardTitle}>Multi-Realm Identity Platform</Text>
            <Text style={styles.bodyText}>
              SojournX Beta now keeps a home realm, a preview realm, and a live profile so the category
              is measurable instead of just promised.
            </Text>
          </ContentCard>
        </>
      )}
    </View>
  );
}

function SpiritualOracleSuite() {
  const ui = useUiRuntime();
  const fallbackTarot = {
    name: "Deck Offline",
    arcana: "Major Arcana",
    intendedMeaning: "Tarot codex is syncing. Return shortly for symbolic guidance.",
    light: "Pause and breathe.",
    shadow: "Rushing without reflection.",
    embodiment: "Ground first, then pull."
  };
  const fallbackRune = {
    name: "Set Offline",
    symbol: "ᛟ",
    intendedMeaning: "Rune matrix is syncing. Return shortly for northern wisdom.",
    light: "Stay receptive.",
    shadow: "Forcing certainty.",
    embodiment: "Hold center and wait for clarity."
  };
  const [activeTarot, setActiveTarot] = useState(
    spiritualTarotDeck.length > 0 ? spiritualTarotDeck[0] : fallbackTarot
  );
  const [activeRune, setActiveRune] = useState(
    spiritualRuneSet.length > 0 ? spiritualRuneSet[0] : fallbackRune
  );

  const pullTarot = () => {
    if (spiritualTarotDeck.length === 0) {
      setActiveTarot(fallbackTarot);
      return;
    }

    const nextCard = spiritualTarotDeck[Math.floor(Math.random() * spiritualTarotDeck.length)];
    setActiveTarot(nextCard);
    ui.playUiAction();
  };

  const pullRune = () => {
    if (spiritualRuneSet.length === 0) {
      setActiveRune(fallbackRune);
      return;
    }

    const nextRune = spiritualRuneSet[Math.floor(Math.random() * spiritualRuneSet.length)];
    setActiveRune(nextRune);
    ui.playUiAction();
  };

  return (
    <View style={styles.spiritualSuiteWrap}>
      <SectionTitle
        title="Celestial Oracle Chamber"
        subtitle="An epic symbolic interface for tarot, runes, and astrological intelligence."
      />

      <ContentCard>
        <Text style={styles.cardKicker}>TAROT SIMULATOR</Text>
        <Text style={styles.spiritualHeadline}>{activeTarot.name}</Text>
        <Text style={styles.cardMeta}>{activeTarot.arcana}</Text>
        <Text style={styles.bodyText}>{activeTarot.intendedMeaning}</Text>
        <View style={styles.featureList}>
          <Text style={styles.spiritualMeaning}>Light Path: {activeTarot.light}</Text>
          <Text style={styles.spiritualMeaning}>Shadow Path: {activeTarot.shadow}</Text>
          <Text style={styles.spiritualMeaning}>Embodiment: {activeTarot.embodiment}</Text>
        </View>
        <PrimaryButton label="Draw Tarot Card" onPress={pullTarot} />
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>RUNE SIMULATOR</Text>
        <Text style={styles.spiritualRuneSymbol}>{activeRune.symbol}</Text>
        <Text style={styles.spiritualHeadline}>{activeRune.name}</Text>
        <Text style={styles.bodyText}>{activeRune.intendedMeaning}</Text>
        <View style={styles.featureList}>
          <Text style={styles.spiritualMeaning}>Light Path: {activeRune.light}</Text>
          <Text style={styles.spiritualMeaning}>Shadow Path: {activeRune.shadow}</Text>
          <Text style={styles.spiritualMeaning}>Embodiment: {activeRune.embodiment}</Text>
        </View>
        <PrimaryButton label="Cast Rune" onPress={pullRune} />
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>BIRTH CHART MATRIX</Text>
        <Text style={styles.spiritualHeadline}>
          Sun {spiritualBirthChart.identity.sun} · Moon {spiritualBirthChart.identity.moon} · Rising{" "}
          {spiritualBirthChart.identity.rising}
        </Text>
        <Text style={styles.spiritualMeaning}>North Node: {spiritualBirthChart.identity.northNode}</Text>

        <View style={styles.featureList}>
          {spiritualBirthChart.placements.map((placement) => (
            <View key={placement.body} style={styles.spiritualPlacement}>
              <Text style={styles.spiritualPlacementTitle}>{placement.body}</Text>
              <Text style={styles.bodyText}>{placement.meaning}</Text>
            </View>
          ))}
        </View>
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>ASTROLOGICAL WEATHER</Text>
        <View style={styles.featureList}>
          {spiritualAstrologicalWeather.map((signal) => (
            <View key={signal.title} style={styles.spiritualPlacement}>
              <Text style={styles.spiritualPlacementTitle}>{signal.title}</Text>
              <Text style={styles.bodyText}>{signal.meaning}</Text>
            </View>
          ))}
        </View>
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>TAROT CODEX · INTENDED MEANINGS</Text>
        <View style={styles.featureList}>
          {spiritualTarotDeck.map((card) => (
            <View key={card.name} style={styles.spiritualPlacement}>
              <Text style={styles.spiritualPlacementTitle}>{card.name}</Text>
              <Text style={styles.bodyText}>{card.intendedMeaning}</Text>
            </View>
          ))}
        </View>
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>RUNE CODEX · INTENDED MEANINGS</Text>
        <View style={styles.featureList}>
          {spiritualRuneSet.map((rune) => (
            <View key={rune.name} style={styles.spiritualPlacement}>
              <Text style={styles.spiritualPlacementTitle}>
                {rune.symbol} {rune.name}
              </Text>
              <Text style={styles.bodyText}>{rune.intendedMeaning}</Text>
            </View>
          ))}
        </View>
      </ContentCard>
    </View>
  );
}

function JournalScreen({
  journalEntries,
  journalBody,
  setJournalBody,
  journalMood,
  setJournalMood,
  onSave
}: {
  journalEntries: JournalEntry[];
  journalBody: string;
  setJournalBody: React.Dispatch<React.SetStateAction<string>>;
  journalMood: string;
  setJournalMood: React.Dispatch<React.SetStateAction<string>>;
  onSave: () => void;
}) {
  return (
    <View>
      <SectionTitle title="Growth Journal" subtitle="A private record of how the beta feels." />

      <ContentCard>
        <FieldLabel label="Mood" helper="Pick the tone of the entry." />
        <MoodRow moods={betaMoods} activeMood={journalMood} onSelect={setJournalMood} />

        <FieldLabel label="Reflection" helper="Write the thing you do not want to lose." />
        <InputField
          value={journalBody}
          onChangeText={setJournalBody}
          placeholder="What changed today?"
          multiline
        />

        <PrimaryButton label="Save Reflection" onPress={onSave} />
      </ContentCard>

      <SectionTitle title="Journal History" subtitle="Stored locally and ordered by the latest entry." />

      {journalEntries.map((entry) => (
        <ContentCard key={entry.id}>
          <Text style={styles.cardKicker}>{entry.mood}</Text>
          <Text style={styles.cardTitle}>{formatRelativeTime(entry.createdAt)}</Text>
          <Text style={styles.bodyText}>{entry.reflection}</Text>
        </ContentCard>
      ))}
    </View>
  );
}

function ProfileScreen({
  profile,
  setProfile,
  posts,
  entries,
  syncedContacts,
  contactSyncState,
  syncingContacts,
  onSyncContacts
}: {
  profile: BetaProfile;
  setProfile: React.Dispatch<React.SetStateAction<BetaProfile>>;
  posts: PulsePost[];
  entries: JournalEntry[];
  syncedContacts: SyncedContact[];
  contactSyncState: ContactSyncState;
  syncingContacts: boolean;
  onSyncContacts: () => void;
}) {
  const ui = useUiRuntime();

  const completion = [
    profile.displayName,
    profile.handle,
    profile.pronouns,
    profile.bio,
    profile.location,
    profile.website,
    profile.status
  ].filter((value) => value.trim().length > 0).length;

  const completionPct = Math.round((completion / 7) * 100);

  return (
    <View>
      <SectionTitle title="Profile Studio" subtitle="Build a complete identity before pre-release." />

      <ContentCard>
        <Text style={styles.cardKicker}>AVATAR</Text>
        <View style={styles.avatarRow}>
          {betaAvatarOptions.map((avatar) => {
            const active = profile.avatar === avatar;

            return (
              <TouchableOpacity
                key={avatar}
                style={[
                  styles.avatarChip,
                  active && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor }
                ]}
                onPress={() => setProfile((current) => ({ ...current, avatar }))}
              >
                <Text style={styles.avatarChipText}>{avatar}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ContentCard>

      <ContentCard>
        <FieldLabel label="Display Name" helper="Primary name shown across profile surfaces." />
        <InputField
          value={profile.displayName}
          onChangeText={(displayName) => setProfile((current) => ({ ...current, displayName }))}
          placeholder="Astra Vale"
        />

        <FieldLabel label="Handle" helper="Unique public identity tag." />
        <InputField
          value={profile.handle}
          onChangeText={(handle) => setProfile((current) => ({ ...current, handle }))}
          placeholder="vaultwalker"
        />

        <FieldLabel label="Status" helper="Current state line shown under your name." />
        <InputField
          value={profile.status}
          onChangeText={(status) => setProfile((current) => ({ ...current, status }))}
          placeholder="Rebuilding in public"
        />

        <FieldLabel label="Relay Number" helper="Private contact anchor for trusted-circle discovery." />
        <InputField
          value={profile.phoneNumber}
          onChangeText={(phoneNumber) => setProfile((current) => ({ ...current, phoneNumber }))}
          placeholder="+1 555 010 2020"
        />

        <FieldLabel label="Pronouns" helper="Optional identity marker." />
        <InputField
          value={profile.pronouns}
          onChangeText={(pronouns) => setProfile((current) => ({ ...current, pronouns }))}
          placeholder="they/them"
        />

        <FieldLabel label="Location" helper="Optional city, country, or region." />
        <InputField
          value={profile.location}
          onChangeText={(location) => setProfile((current) => ({ ...current, location }))}
          placeholder="Lisbon, PT"
        />

        <FieldLabel label="Website" helper="Optional profile link." />
        <InputField
          value={profile.website}
          onChangeText={(website) => setProfile((current) => ({ ...current, website }))}
          placeholder={`${publicSiteUrl}/me`}
        />

        <FieldLabel label="Bio" helper="Tell people who you are becoming." />
        <InputField
          value={profile.bio}
          onChangeText={(bio) => setProfile((current) => ({ ...current, bio }))}
          placeholder="Designing a more intentional social future."
          multiline
        />
      </ContentCard>

      <ContactSyncCard
        profile={profile}
        contactSyncState={contactSyncState}
        syncedContacts={syncedContacts}
        syncingContacts={syncingContacts}
        onSyncContacts={onSyncContacts}
        showToggle
        onToggle={(contactsSyncEnabled) => setProfile((current) => ({ ...current, contactsSyncEnabled }))}
        title="Trusted Circle"
        kicker="SIGNAL-LIKE CONTACT LAYER"
        subtitle="Sync your device contacts into a quiet, consent-first circle."
      />

      <ContentCard>
        <Text style={styles.cardKicker}>PROFILE PREVIEW</Text>
        <View style={[styles.profilePreview, { borderColor: ui.primaryColor }]}> 
          <View style={styles.profilePreviewHeader}>
            <View style={[styles.profileAvatar, { backgroundColor: ui.primaryColor }]}>
              <Text style={styles.profileAvatarText}>{profile.avatar}</Text>
            </View>
            <View style={styles.profileIdentityBlock}>
              <Text style={styles.cardTitle}>{profile.displayName || "Unnamed"}</Text>
              <Text style={styles.cardMeta}>@{profile.handle || "handle"}</Text>
              <Text style={styles.bodyText}>{profile.status || "Set a profile status"}</Text>
            </View>
          </View>
          <View style={styles.featureList}>
            <Text style={styles.featureText}>Pronouns: {profile.pronouns || "-"}</Text>
            <Text style={styles.featureText}>Location: {profile.location || "-"}</Text>
            <Text style={styles.featureText}>Website: {profile.website || "-"}</Text>
            <Text style={styles.featureText}>Bio: {profile.bio || "-"}</Text>
          </View>
        </View>
      </ContentCard>

      <View style={styles.metricGrid}>
        <MetricCard label="Completion" value={`${completionPct}%`} />
        <MetricCard label="Pulses" value={String(posts.length)} />
        <MetricCard label="Entries" value={String(entries.length)} />
        <MetricCard label="Home Realm" value={profile.homeRealm} />
      </View>
    </View>
  );
}

function SettingsScreen({
  profile,
  setProfile,
  contactSyncState,
  syncingContacts,
  onSyncContacts,
  onReset
}: {
  profile: BetaProfile;
  setProfile: React.Dispatch<React.SetStateAction<BetaProfile>>;
  contactSyncState: ContactSyncState;
  syncingContacts: boolean;
  onSyncContacts: () => void;
  onReset: () => void;
}) {
  const ui = useUiRuntime();

  return (
    <View>
      <SectionTitle title="Beta Settings" subtitle="Local identity, privacy, and device controls." />

      <ContentCard>
        <FieldLabel label="Handle" helper="Update the beta identity." />
        <InputField
          value={profile.handle}
          onChangeText={(handle) => setProfile((current) => ({ ...current, handle }))}
        />

        <FieldLabel label="Pronouns" helper="Identity note used across the beta." />
        <InputField
          value={profile.pronouns}
          onChangeText={(pronouns) => setProfile((current) => ({ ...current, pronouns }))}
        />

        <FieldLabel label="Bio" helper="A brief statement about the current version of you." />
        <InputField
          value={profile.bio}
          onChangeText={(bio) => setProfile((current) => ({ ...current, bio }))}
          multiline
        />
      </ContentCard>

      <ContentCard>
        <FieldLabel label="Home Realm" helper="Your default realm when the vault opens." />
        <RealmChipRow
          activeRealmKey={profile.homeRealm}
          onSelect={(homeRealm) => setProfile((current) => ({ ...current, homeRealm }))}
          realmsToShow={betaRealmPreviewOrder}
        />

        <FieldLabel label="Private Mode" helper="Anonymize pulse posts by default." />
        <ToggleRow
          label={profile.privateMode ? "Private" : "Visible"}
          description={profile.privateMode ? "Posts are anonymized." : "Posts show your handle."}
          value={profile.privateMode}
          onValueChange={(privateMode) => setProfile((current) => ({ ...current, privateMode }))}
        />
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>CONTACT VEIL</Text>
        <Text style={styles.cardTitle}>Trusted-circle sync stays local-first.</Text>
        <Text style={styles.bodyText}>
          Keep Signal-like contact discovery inside the anonymity realm without creating a public graph.
        </Text>

        <FieldLabel label="Sync Contacts" helper="Request device access only when you want to refresh the circle." />
        <ToggleRow
          label={profile.contactsSyncEnabled ? "Sync Enabled" : "Sync Disabled"}
          description={contactSyncSummary(contactSyncState)}
          value={profile.contactsSyncEnabled}
          onValueChange={(contactsSyncEnabled) => setProfile((current) => ({ ...current, contactsSyncEnabled }))}
        />

        <TouchableOpacity
          style={[styles.secondaryButton, { borderColor: ui.primaryColor }]}
          activeOpacity={ui.actionOpacity}
          onPress={() => onSyncContacts()}
        >
          <Text style={styles.secondaryButtonText}>
            {syncingContacts
              ? "Syncing trusted circle..."
              : profile.contactsSyncEnabled
                ? "Sync contacts now"
                : "Turn on sync above"}
          </Text>
        </TouchableOpacity>
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>INTERFACE ENGINE</Text>
        <Text style={styles.cardTitle}>Customize color, style, and size.</Text>
        <Text style={styles.bodyText}>
          These controls instantly update the beta UI and stay persisted on this device.
        </Text>

        <FieldLabel label="Accent Color" helper="Primary interactive color for active controls." />
        <SelectionRow<UiAccent>
          items={[
            { key: "crimson", label: "Crimson" },
            { key: "sunset", label: "Sunset" },
            { key: "emerald", label: "Emerald" },
            { key: "electric", label: "Electric" },
            { key: "amber", label: "Amber" }
          ]}
          value={ui.preferences.accent}
          onSelect={(accent) => ui.setPreferences((current) => ({ ...current, accent }))}
        />

        <FieldLabel label="Interface Style" helper="How cards and surfaces are rendered." />
        <SelectionRow<UiStylePreset>
          items={[
            { key: "vault", label: "Vault" },
            { key: "glass", label: "Glass" },
            { key: "mono", label: "Mono" }
          ]}
          value={ui.preferences.style}
          onSelect={(style) => ui.setPreferences((current) => ({ ...current, style }))}
        />

        <FieldLabel label="UI Size" helper="Global sizing preset for readability and density." />
        <SelectionRow<UiScale>
          items={[
            { key: "compact", label: "Compact" },
            { key: "balanced", label: "Balanced" },
            { key: "immersive", label: "Immersive" }
          ]}
          value={ui.preferences.scale}
          onSelect={(scale) => ui.setPreferences((current) => ({ ...current, scale }))}
        />

        <FieldLabel label="Layout Density" helper="Control spacing intensity across the interface." />
        <SelectionRow<UiDensity>
          items={[
            { key: "cozy", label: "Cozy" },
            { key: "balanced", label: "Balanced" },
            { key: "dense", label: "Dense" }
          ]}
          value={ui.preferences.density}
          onSelect={(density) => ui.setPreferences((current) => ({ ...current, density }))}
        />

        <FieldLabel label="Corner Style" helper="Choose how rounded cards and controls should feel." />
        <SelectionRow<UiCorners>
          items={[
            { key: "soft", label: "Soft" },
            { key: "balanced", label: "Balanced" },
            { key: "sharp", label: "Sharp" }
          ]}
          value={ui.preferences.corners}
          onSelect={(corners) => ui.setPreferences((current) => ({ ...current, corners }))}
        />

        <FieldLabel label="Transition Style" helper="Visual motion between major tab surfaces." />
        <SelectionRow<UiTransitionStyle>
          items={[
            { key: "slide", label: "Slide" },
            { key: "fade", label: "Fade" },
            { key: "zoom", label: "Zoom" }
          ]}
          value={ui.preferences.transitionStyle}
          onSelect={(transitionStyle) => ui.setPreferences((current) => ({ ...current, transitionStyle }))}
        />

        <FieldLabel label="Transition Speed" helper="How fast transitions and reactions should feel." />
        <SelectionRow<UiTransitionSpeed>
          items={[
            { key: "calm", label: "Calm" },
            { key: "balanced", label: "Balanced" },
            { key: "snappy", label: "Snappy" }
          ]}
          value={ui.preferences.transitionSpeed}
          onSelect={(transitionSpeed) =>
            ui.setPreferences((current) => ({ ...current, transitionSpeed }))
          }
        />

        <FieldLabel label="Action Intensity" helper="Tap and interaction response weight." />
        <SelectionRow<UiActionStyle>
          items={[
            { key: "subtle", label: "Subtle" },
            { key: "balanced", label: "Balanced" },
            { key: "bold", label: "Bold" }
          ]}
          value={ui.preferences.actionStyle}
          onSelect={(actionStyle) => ui.setPreferences((current) => ({ ...current, actionStyle }))}
        />

        <FieldLabel label="Action Sounds" helper="Enable audible feedback for taps and button actions." />
        <ToggleRow
          label={ui.preferences.soundEnabled ? "Sound On" : "Sound Off"}
          description={ui.preferences.soundEnabled ? "UI taps will play your selected sound pack." : "Silent interactions."}
          value={ui.preferences.soundEnabled}
          onValueChange={(soundEnabled) => ui.setPreferences((current) => ({ ...current, soundEnabled }))}
        />

        <FieldLabel label="Sound Pack" helper="Pick the tonal personality for interaction sounds." />
        <SelectionRow<UiSoundPack>
          items={[
            { key: "soft", label: "Soft" },
            { key: "tech", label: "Tech" },
            { key: "cosmic", label: "Cosmic" }
          ]}
          value={ui.preferences.soundPack}
          onSelect={(soundPack) => ui.setPreferences((current) => ({ ...current, soundPack }))}
        />

        <FieldLabel label="Sound Volume" helper="Output level for UI interaction sounds." />
        <SelectionRow<"low" | "mid" | "high">
          items={[
            { key: "low", label: "Low" },
            { key: "mid", label: "Mid" },
            { key: "high", label: "High" }
          ]}
          value={ui.preferences.soundVolume <= 0.3 ? "low" : ui.preferences.soundVolume <= 0.55 ? "mid" : "high"}
          onSelect={(level) =>
            ui.setPreferences((current) => ({
              ...current,
              soundVolume: level === "low" ? 0.25 : level === "mid" ? 0.45 : 0.7
            }))
          }
        />

        <TouchableOpacity
          style={[styles.secondaryButton, { marginTop: spacing.sm, borderColor: ui.primaryColor }]}
          activeOpacity={ui.actionOpacity}
          onPress={() => ui.playUiAction()}
        >
          <Text style={styles.secondaryButtonText}>Preview Action Sound</Text>
        </TouchableOpacity>

        <FieldLabel label="Realm Blend" helper="Let environments hand off context between connected realms." />
        <ToggleRow
          label={ui.blendEnabled ? "Blend Enabled" : "Blend Disabled"}
          description={ui.blendEnabled ? "Cross-realm flows are active." : "Realms stay isolated."}
          value={ui.blendEnabled}
          onValueChange={ui.setBlendEnabled}
        />
      </ContentCard>

      <ContentCard>
        <Text style={styles.cardKicker}>DEVICE CONTROLS</Text>
        <Text style={styles.cardTitle}>Local beta data only.</Text>
        <Text style={styles.bodyText}>
          Resetting clears the local vault state from this device. Nothing in this beta leaves the
          device unless you build a backend around it.
        </Text>

        <TouchableOpacity style={[styles.secondaryButton, styles.destructiveButton]} onPress={onReset}>
          <Text style={styles.secondaryButtonText}>Reset Local Vault</Text>
        </TouchableOpacity>
      </ContentCard>
    </View>
  );
}

function FieldLabel({ label, helper }: { label: string; helper: string }) {
  const ui = useUiRuntime();

  return (
    <View style={styles.fieldLabelWrap}>
      <Text style={[styles.fieldLabel, { fontSize: 14 * ui.scale }]}>{label}</Text>
      <Text style={styles.fieldHelper}>{helper}</Text>
    </View>
  );
}

function InputField({
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> & { multiline?: boolean }) {
  const ui = useUiRuntime();

  return (
    <TextInput
      {...props}
      placeholderTextColor={colors.mutedGray}
      multiline={multiline}
      style={[
        styles.input,
        multiline && styles.inputMultiline,
        {
          borderColor: ui.preferences.style === "glass" ? "rgba(255,255,255,0.25)" : colors.borderBlack,
          fontSize: 14 * ui.scale,
          borderRadius: Math.round(radius.md * ui.cornerScale)
        }
      ]}
    />
  );
}

function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const ui = useUiRuntime();

  return (
    <TouchableOpacity
      style={[
        styles.primaryButton,
        {
          backgroundColor: ui.primaryColor,
          borderColor: ui.glowColor,
          borderWidth: ui.preferences.style === "mono" ? 1 : 0,
          paddingVertical: Math.round(15 * ui.scale * ui.density),
          borderRadius: Math.round(radius.md * ui.cornerScale)
        }
      ]}
      activeOpacity={ui.actionOpacity}
      onPress={() => {
        ui.playUiAction();
        onPress();
      }}
    >
      <Text style={[styles.primaryButtonText, { fontSize: 15 * ui.scale }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

function LaunchButton({ label, hint, onPress }: { label: string; hint: string; onPress: () => void }) {
  const ui = useUiRuntime();

  return (
    <TouchableOpacity
      style={styles.launchButton}
      activeOpacity={ui.actionOpacity}
      onPress={() => {
        ui.playUiAction();
        onPress();
      }}
    >
      <Text style={styles.launchLabel}>{label}</Text>
      <Text style={styles.launchHint}>{hint}</Text>
    </TouchableOpacity>
  );
}

function ChecklistCard({ title, detail }: { title: string; detail: string }) {
  return (
    <ContentCard>
      <Text style={styles.cardKicker}>CHECK</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>{detail}</Text>
    </ContentCard>
  );
}

function ContactSyncCard({
  profile,
  contactSyncState,
  syncedContacts,
  syncingContacts,
  onSyncContacts,
  showToggle,
  onToggle,
  title = "Ghost Circle",
  kicker = "SYNCED CONTACTS",
  subtitle = "Trusted contacts are staged for private intros and secure follow-up."
}: {
  profile: BetaProfile;
  contactSyncState: ContactSyncState;
  syncedContacts: SyncedContact[];
  syncingContacts: boolean;
  onSyncContacts: () => void;
  showToggle?: boolean;
  onToggle?: (value: boolean) => void;
  title?: string;
  kicker?: string;
  subtitle?: string;
}) {
  const ui = useUiRuntime();
  const activeContacts = syncedContacts.slice(0, 4);
  const hasRelayNumber = hasValidRelayNumber(profile.phoneNumber);
  const relayNumber = normalizeRelayNumber(profile.phoneNumber);

  return (
    <ContentCard>
      <Text style={[styles.cardKicker, { color: colors.ghostLilac }]}>{kicker}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.bodyText}>{subtitle}</Text>

      <View style={styles.contactVaultStats}>
        <View style={[styles.contactVaultMetric, { borderColor: ui.glowColor }]}>
          <Text style={styles.contactVaultLabel}>Permission</Text>
          <Text style={styles.contactVaultValue}>{contactPermissionLabel(contactSyncState.permission)}</Text>
        </View>
        <View style={[styles.contactVaultMetric, { borderColor: ui.glowColor }]}>
          <Text style={styles.contactVaultLabel}>Imported</Text>
          <Text style={styles.contactVaultValue}>{String(contactSyncState.importedCount)}</Text>
        </View>
      </View>

      {showToggle && onToggle ? (
        <ToggleRow
          label={profile.contactsSyncEnabled ? "Trusted circle active" : "Trusted circle paused"}
          description={contactSyncSummary(contactSyncState)}
          value={profile.contactsSyncEnabled}
          onValueChange={onToggle}
        />
      ) : (
        <Text style={styles.helperNote}>{contactSyncSummary(contactSyncState)}</Text>
      )}

      {hasRelayNumber && (
        <Text style={[styles.helperNote, styles.contactRelayLabel]}>Relay anchor: {relayNumber}</Text>
      )}

      <TouchableOpacity
        style={[styles.contactSyncButton, { borderColor: ui.glowColor }]}
        activeOpacity={ui.actionOpacity}
        onPress={() => onSyncContacts()}
      >
        {syncingContacts ? (
          <View style={styles.contactSyncButtonInner}>
            <ActivityIndicator color={colors.boneWhite} size="small" />
            <Text style={styles.contactSyncButtonText}>Syncing ghost circle...</Text>
          </View>
        ) : (
          <Text style={styles.contactSyncButtonText}>
            {profile.contactsSyncEnabled ? "Refresh trusted contacts" : "Turn on sync in Profile or Settings"}
          </Text>
        )}
      </TouchableOpacity>

      {activeContacts.length > 0 ? (
        <View style={styles.contactList}>
          {activeContacts.map((contact) => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={[styles.contactAvatar, { borderColor: ui.glowColor }]}>
                <Text style={styles.contactAvatarText}>{contact.initials}</Text>
              </View>
              <View style={styles.contactCopy}>
                <Text style={styles.contactName}>{contact.displayName}</Text>
                <Text style={styles.contactMeta}>{contact.phoneNumber}</Text>
                <Text style={styles.contactTrustNote}>{contact.trustNote}</Text>
              </View>
              <View
                style={[
                  styles.contactStatePill,
                  contact.matchState === "on-sojourn"
                    ? styles.contactStateActive
                    : contact.matchState === "invite-ready"
                      ? styles.contactStateInvite
                      : styles.contactStateRelay
                ]}
              >
                <Text style={styles.contactStateText}>{contactStateLabel(contact.matchState)}</Text>
                <Text style={styles.contactStateMeta}>{contact.lastSeen}</Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.contactEmptyState}>
          <Text style={styles.contactEmptyTitle}>No trusted contacts staged yet.</Text>
          <Text style={styles.contactEmptyBody}>
            Turn on sync to pull device contacts into the anonymity realm without exposing them elsewhere.
          </Text>
        </View>
      )}
    </ContentCard>
  );
}

function PulseCard({ post }: { post: PulsePost }) {
  const realm = realms.find((item) => item.key === post.realmKey) ?? realms[0];

  return (
    <ContentCard>
      <Text style={styles.cardKicker}>{realm.shortTitle}</Text>
      <Text style={styles.cardTitle}>{post.body}</Text>
      <Text style={styles.bodyText}>{post.author}</Text>
      <View style={styles.pulseMetaRow}>
        <Text style={styles.cardMeta}>{post.mood}</Text>
        <Text style={styles.cardMeta}>{formatRelativeTime(post.createdAt)}</Text>
      </View>
      <Text style={styles.cardMeta}>{post.replies} replies</Text>
    </ContentCard>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onValueChange
}: {
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const ui = useUiRuntime();

  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleCopy}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.borderBlack, true: ui.primaryColor }}
        thumbColor={value ? colors.boneWhite : colors.mutedGray}
      />
    </View>
  );
}

function RealmChipRow({
  activeRealmKey,
  onSelect,
  realmsToShow
}: {
  activeRealmKey: RealmKey;
  onSelect: (realmKey: RealmKey) => void;
  realmsToShow: RealmKey[];
}) {
  const ui = useUiRuntime();

  return (
    <View style={styles.realmChipWrap}>
      {realmsToShow.map((realmKey) => {
        const realm = realms.find((item) => item.key === realmKey) ?? realms[0];
        const active = activeRealmKey === realm.key;

        return (
          <TouchableOpacity
            key={realm.key}
            onPress={() => {
              ui.playUiAction();
              onSelect(realm.key);
            }}
            activeOpacity={ui.actionOpacity}
            style={[
              styles.realmChip,
              active && styles.realmChipActive,
              active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
            ]}
          >
            <Text style={[styles.realmIcon, { color: ui.glowColor }]}>{realm.icon}</Text>
            <Text style={[styles.realmChipText, active && styles.realmChipTextActive]}>
              {realm.shortTitle}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function MoodRow({
  moods,
  activeMood,
  onSelect
}: {
  moods: readonly string[];
  activeMood: string;
  onSelect: (mood: string) => void;
}) {
  const ui = useUiRuntime();

  return (
    <View style={styles.moodRow}>
      {moods.map((mood) => {
        const active = mood === activeMood;

        return (
          <TouchableOpacity
            key={mood}
            onPress={() => {
              ui.playUiAction();
              onSelect(mood);
            }}
            activeOpacity={ui.actionOpacity}
            style={[
              styles.moodChip,
              active && styles.moodChipActive,
              active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
            ]}
          >
            <Text style={[styles.moodChipText, active && styles.moodChipTextActive]}>{mood}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function SelectionRow<T extends string>({
  items,
  value,
  onSelect
}: {
  items: Array<{ key: T; label: string }>;
  value: T;
  onSelect: (value: T) => void;
}) {
  const ui = useUiRuntime();

  return (
    <View style={styles.realmChipWrap}>
      {items.map((item) => {
        const active = item.key === value;

        return (
          <TouchableOpacity
            key={item.key}
            onPress={() => {
              ui.playUiAction();
              onSelect(item.key);
            }}
            activeOpacity={ui.actionOpacity}
            style={[
              styles.realmChip,
              active && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
            ]}
          >
            <Text style={[styles.realmChipText, active && styles.realmChipTextActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ContentCard({ children }: { children: React.ReactNode }) {
  const ui = useUiRuntime();

  const cardPreset =
    ui.preferences.style === "glass"
      ? {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.18)"
        }
      : ui.preferences.style === "mono"
        ? {
            backgroundColor: colors.deepBlack,
            borderColor: "#4B5563"
          }
        : {
            backgroundColor: colors.cardBlack,
            borderColor: colors.borderBlack
          };

  return (
    <View
      style={[
        styles.contentCard,
        cardPreset,
        {
          padding: Math.round(spacing.md * ui.scale * ui.density),
          borderRadius: Math.round(radius.lg * ui.cornerScale),
          marginBottom: Math.round(spacing.md * ui.density)
        }
      ]}
    >
      {children}
    </View>
  );
}

function Pill({ label }: { label: string }) {
  const ui = useUiRuntime();

  return (
    <View style={[styles.pill, { borderColor: ui.primaryColor }]}> 
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionHeading}>{title}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
    </View>
  );
}

function contactPermissionLabel(permission: ContactSyncState["permission"]): string {
  switch (permission) {
    case "granted":
      return "Granted";
    case "denied":
      return "Denied";
    case "unavailable":
      return "Preview";
    default:
      return "Idle";
  }
}

function contactStateLabel(matchState: SyncedContact["matchState"]): string {
  switch (matchState) {
    case "on-sojourn":
      return "On Sojourn";
    case "invite-ready":
      return "Invite";
    default:
      return "Relay";
  }
}

function normalizeRelayNumber(value: string): string {
  return value.trim().replace(/[^\d+]/g, "");
}

function hasValidRelayNumber(value: string): boolean {
  return normalizeRelayNumber(value).replace(/\D/g, "").length >= 7;
}

function contactSyncSummary(state: ContactSyncState): string {
  if (!state.enabled) {
    return "Contact sync is off. Nothing leaves the device until you request a refresh.";
  }

  if (state.permission === "denied") {
    return "Permission was denied. Re-enable contact access to rebuild the trusted circle.";
  }

  if (state.source === "preview") {
    return "Device sync is unavailable here, so the vault shows a sleek preview circle instead.";
  }

  if (state.permission === "granted") {
    return `${state.importedCount} trusted contacts are staged from ${state.deviceContactCount} device entries.`;
  }

  return "Ready to sync your trusted circle into the anonymity realm.";
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "just now";
  }

  const diffMinutes = Math.max(1, Math.floor((Date.now() - date.getTime()) / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.vaultBlack
  },
  appShell: {
    flex: 1,
    backgroundColor: colors.vaultBlack
  },
  realmThemeWash: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    right: -40,
    top: 14,
    opacity: 0.9
  },
  realmThemeOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    left: -24,
    top: 180,
    opacity: 0.15
  },
  content: {
    padding: spacing.md,
    paddingBottom: 40
  },
  ageGate: {
    flex: 1,
    padding: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.vaultBlack
  },
  glowOrb: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: colors.darkRed,
    opacity: 0.35,
    top: 90
  },
  logoMark: {
    fontSize: 74,
    color: colors.crimsonGlow,
    fontWeight: "900",
    letterSpacing: 8
  },
  logoImage: {
    width: 148,
    height: 148,
    borderRadius: 36,
    borderWidth: 2,
    marginBottom: spacing.sm
  },
  title: {
    color: colors.boneWhite,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 1
  },
  tagline: {
    color: colors.mutedGray,
    fontSize: 16,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  ageCard: {
    marginTop: spacing.xl,
    width: "100%",
    backgroundColor: colors.cardBlack,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.darkRed
  },
  ageTitle: {
    color: colors.boneWhite,
    fontSize: 24,
    fontWeight: "800",
    marginBottom: spacing.sm
  },
  disclaimer: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 20,
    marginTop: spacing.md
  },
  primaryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.sojournRed,
    borderRadius: radius.md,
    paddingVertical: 15,
    alignItems: "center"
  },
  primaryButtonText: {
    color: colors.boneWhite,
    fontWeight: "800",
    fontSize: 15
  },
  footerNote: {
    color: colors.mutedGray,
    fontSize: 11,
    textAlign: "center",
    marginTop: spacing.lg,
    lineHeight: 17
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  profileAvatarMini: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  profileAvatarMiniText: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "900"
  },
  brand: {
    color: colors.boneWhite,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  headerSub: {
    color: colors.mutedGray,
    fontSize: 12,
    marginTop: 2
  },
  vaultBadge: {
    backgroundColor: colors.darkRed,
    borderColor: colors.crimsonGlow,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999
  },
  vaultBadgeText: {
    color: colors.boneWhite,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  nav: {
    flexDirection: "row",
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.sm,
    gap: 6
  },
  navItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.deepBlack,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderBlack
  },
  navItemActive: {
    backgroundColor: colors.sojournRed,
    borderColor: colors.crimsonGlow
  },
  navText: {
    color: colors.mutedGray,
    fontSize: 11,
    fontWeight: "700"
  },
  navTextActive: {
    color: colors.boneWhite
  },
  heroCard: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.darkRed
  },
  heroEyebrow: {
    color: colors.crimsonGlow,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: spacing.sm
  },
  heroTitle: {
    color: colors.boneWhite,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900"
  },
  heroBody: {
    color: colors.softGray,
    fontSize: 15,
    lineHeight: 23,
    marginTop: spacing.md
  },
  heroPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: spacing.lg
  },
  pill: {
    borderColor: colors.darkRed,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.deepBlack
  },
  pillText: {
    color: colors.boneWhite,
    fontSize: 12,
    fontWeight: "700"
  },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.md
  },
  sectionHeading: {
    color: colors.boneWhite,
    fontSize: 23,
    fontWeight: "900"
  },
  sectionSubtitle: {
    color: colors.mutedGray,
    fontSize: 14,
    marginTop: 4,
    lineHeight: 20
  },
  contentCard: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    marginBottom: spacing.md
  },
  cardKicker: {
    color: colors.crimsonGlow,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    marginBottom: 8,
    textTransform: "uppercase"
  },
  cardTitle: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24
  },
  cardMeta: {
    color: colors.mutedGray,
    fontSize: 13,
    marginTop: spacing.sm
  },
  bodyText: {
    color: colors.softGray,
    fontSize: 14,
    lineHeight: 22
  },
  helperNote: {
    color: colors.mutedGray,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.sm
  },
  avatarRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  avatarChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    backgroundColor: colors.deepBlack,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarChipText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "800"
  },
  profilePreview: {
    borderWidth: 1,
    borderColor: colors.borderBlack,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.deepBlack
  },
  profilePreviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md
  },
  profileAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  profileAvatarText: {
    color: colors.boneWhite,
    fontSize: 26,
    fontWeight: "900"
  },
  profileIdentityBlock: {
    flex: 1
  },
  contactRelayLabel: {
    color: colors.ghostLilac
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  contactVaultStats: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.md
  },
  contactVaultMetric: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: "rgba(9,10,18,0.76)"
  },
  contactVaultLabel: {
    color: colors.mistBlue,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.1
  },
  contactVaultValue: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 6
  },
  metricCard: {
    width: "48%",
    backgroundColor: colors.deepBlack,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    padding: spacing.md
  },
  metricLabel: {
    color: colors.mutedGray,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginBottom: 6
  },
  metricValue: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "900"
  },
  launchRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  launchButton: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    padding: spacing.md
  },
  launchLabel: {
    color: colors.boneWhite,
    fontSize: 16,
    fontWeight: "900"
  },
  launchHint: {
    color: colors.mutedGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6
  },
  fieldLabelWrap: {
    marginBottom: spacing.sm
  },
  fieldLabel: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800"
  },
  fieldHelper: {
    color: colors.mutedGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderBlack,
    backgroundColor: colors.deepBlack,
    color: colors.boneWhite,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: spacing.md
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: "top"
  },
  realmSelector: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  realmChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  realmChip: {
    backgroundColor: colors.deepBlack,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
    minWidth: 96
  },
  realmChipActive: {
    backgroundColor: colors.sojournRed,
    borderColor: colors.crimsonGlow
  },
  realmChipText: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "800"
  },
  realmChipTextActive: {
    color: colors.boneWhite
  },
  realmIcon: {
    color: colors.crimsonGlow,
    fontSize: 24,
    marginBottom: 8
  },
  realmDetail: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.darkRed,
    marginBottom: spacing.md
  },
  realmDetailIcon: {
    color: colors.crimsonGlow,
    fontSize: 38,
    marginBottom: spacing.sm
  },
  realmDetailTitle: {
    color: colors.boneWhite,
    fontSize: 28,
    fontWeight: "900"
  },
  realmPromise: {
    color: colors.crimsonGlow,
    fontSize: 15,
    fontWeight: "800",
    marginTop: spacing.xs,
    marginBottom: spacing.md
  },
  featureList: {
    marginTop: spacing.md,
    gap: spacing.sm
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  featureBullet: {
    color: colors.crimsonGlow,
    fontSize: 12,
    marginTop: 3
  },
  featureText: {
    flex: 1,
    color: colors.softGray,
    fontSize: 14,
    lineHeight: 20
  },
  secondaryButton: {
    marginTop: spacing.lg,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
    backgroundColor: colors.deepBlack,
    borderWidth: 1,
    borderColor: colors.borderBlack
  },
  secondaryButtonDisabled: {
    opacity: 0.7
  },
  secondaryButtonText: {
    color: colors.boneWhite,
    fontWeight: "800",
    fontSize: 14
  },
  contactSyncButton: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.16)",
    borderWidth: 1
  },
  contactSyncButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  contactSyncButtonText: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800"
  },
  pulseMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: spacing.md
  },
  moodChip: {
    borderColor: colors.darkRed,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.deepBlack
  },
  moodChipActive: {
    backgroundColor: colors.sojournRed,
    borderColor: colors.crimsonGlow
  },
  moodChipText: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "700"
  },
  moodChipTextActive: {
    color: colors.boneWhite
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md
  },
  toggleCopy: {
    flex: 1
  },
  toggleLabel: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800"
  },
  toggleDescription: {
    color: colors.mutedGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  contactList: {
    gap: spacing.sm
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(9,10,18,0.72)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.16)"
  },
  contactAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.14)"
  },
  contactAvatarText: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "900"
  },
  contactCopy: {
    flex: 1
  },
  contactName: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800"
  },
  contactMeta: {
    color: colors.mistBlue,
    fontSize: 12,
    marginTop: 2
  },
  contactTrustNote: {
    color: colors.softGray,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4
  },
  contactStatePill: {
    minWidth: 88,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center"
  },
  contactStateActive: {
    backgroundColor: "rgba(139,92,246,0.22)"
  },
  contactStateInvite: {
    backgroundColor: "rgba(56,189,248,0.2)"
  },
  contactStateRelay: {
    backgroundColor: "rgba(245,158,11,0.18)"
  },
  contactStateText: {
    color: colors.boneWhite,
    fontSize: 11,
    fontWeight: "900"
  },
  contactStateMeta: {
    color: colors.softGray,
    fontSize: 10,
    marginTop: 2
  },
  contactEmptyState: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.18)",
    backgroundColor: "rgba(9,10,18,0.72)",
    padding: spacing.md
  },
  contactEmptyTitle: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4
  },
  contactEmptyBody: {
    color: colors.softGray,
    fontSize: 12,
    lineHeight: 18
  },
  destructiveButton: {
    borderColor: colors.darkRed,
    marginTop: spacing.md
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  loadingKicker: {
    color: colors.crimsonGlow,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    marginBottom: spacing.sm
  },
  loadingTitle: {
    color: colors.boneWhite,
    fontSize: 24,
    fontWeight: "900"
  },
  spiritualSuiteWrap: {
    marginTop: spacing.md
  },
  spiritualHeadline: {
    color: colors.boneWhite,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 30
  },
  spiritualRuneSymbol: {
    color: "#A5B4FC",
    fontSize: 44,
    marginBottom: spacing.xs
  },
  spiritualMeaning: {
    color: "#D1D5FF",
    fontSize: 13,
    lineHeight: 20
  },
  spiritualPlacement: {
    borderWidth: 1,
    borderColor: "rgba(165,180,252,0.35)",
    backgroundColor: "rgba(79,70,229,0.12)",
    borderRadius: radius.md,
    padding: spacing.sm
  },
  spiritualPlacementTitle: {
    color: "#C7D2FE",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: "uppercase"
  },
  // ── Social Realm ──────────────────────────────────────────────────────────
  socialHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md
  },
  socialHeaderTitle: {
    fontSize: 26,
    fontWeight: "900"
  },
  socialHeaderSub: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 2
  },
  socialHeaderBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  socialHeaderBadgeText: {
    color: colors.boneWhite,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  socialStoriesSection: {
    marginBottom: spacing.md
  },
  socialStoriesScroll: {
    gap: 12,
    paddingBottom: 4
  },
  socialStoryWrap: {
    alignItems: "center",
    width: 64
  },
  socialStoryRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    padding: 2,
    marginBottom: 6
  },
  socialStoryAvatar: {
    flex: 1,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  socialStoryAvatarAdd: {
    color: colors.boneWhite,
    fontSize: 22,
    fontWeight: "900"
  },
  socialStoryAvatarText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "900"
  },
  socialStoryName: {
    color: colors.softGray,
    fontSize: 11,
    textAlign: "center",
    width: 60
  },
  socialCreateBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    backgroundColor: colors.cardBlack,
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  socialCreateAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center"
  },
  socialCreateAvatarText: {
    color: colors.boneWhite,
    fontSize: 16,
    fontWeight: "900"
  },
  socialCreateInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 9,
    backgroundColor: colors.deepBlack
  },
  socialTabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.borderBlack,
    marginBottom: spacing.md
  },
  socialTabItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent"
  },
  socialTabText: {
    color: colors.mutedGray,
    fontSize: 13,
    fontWeight: "800"
  },
  socialPost: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    marginBottom: spacing.md,
    overflow: "hidden"
  },
  socialPostHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.sm
  },
  socialPostAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  socialPostAvatarText: {
    fontSize: 18,
    fontWeight: "900"
  },
  socialPostMeta: {
    flex: 1
  },
  socialPostAuthor: {
    color: colors.boneWhite,
    fontSize: 15,
    fontWeight: "800"
  },
  socialPostHandle: {
    color: colors.mutedGray,
    fontSize: 12,
    marginTop: 2
  },
  socialPostBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4
  },
  socialPostBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8
  },
  socialPostBody: {
    color: colors.softGray,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md
  },
  socialPostDivider: {
    height: 1,
    backgroundColor: colors.borderBlack,
    marginHorizontal: spacing.md
  },
  socialPostActions: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xl
  },
  socialPostAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  socialPostActionIcon: {
    color: colors.mutedGray,
    fontSize: 17
  },
  socialPostActionText: {
    color: colors.mutedGray,
    fontSize: 13,
    fontWeight: "700"
  },
  socialVideoHeader: {
    marginBottom: spacing.md
  },
  socialVideoHeaderTitle: {
    color: colors.boneWhite,
    fontSize: 20,
    fontWeight: "900"
  },
  socialVideoHeaderSub: {
    color: colors.mutedGray,
    fontSize: 13,
    marginTop: 4
  },
  socialVideoCard: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    marginBottom: spacing.md,
    overflow: "hidden"
  },
  socialVideoThumb: {
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  socialVideoThumbPlay: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 36
  },
  socialVideoDuration: {
    position: "absolute",
    bottom: 8,
    right: 10,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  socialVideoDurationText: {
    color: colors.boneWhite,
    fontSize: 12,
    fontWeight: "700"
  },
  socialVideoInfo: {
    flexDirection: "row",
    gap: spacing.sm,
    padding: spacing.md
  },
  socialVideoChannelAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  socialVideoChannelAvatarText: {
    fontSize: 14,
    fontWeight: "900"
  },
  socialVideoText: {
    flex: 1
  },
  socialVideoTitle: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 20,
    marginBottom: 4
  },
  socialVideoMeta: {
    color: colors.mutedGray,
    fontSize: 12,
    lineHeight: 17
  },
  socialFriendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  socialFriendChip: {
    width: "47%",
    backgroundColor: colors.deepBlack,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center"
  },
  socialFriendAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6
  },
  socialFriendAvatarText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "900"
  },
  socialFriendName: {
    color: colors.boneWhite,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center"
  },
  socialFriendStatus: {
    fontSize: 11,
    marginTop: 3
  },
  socialDiscoverTagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.md
  },
  socialDiscoverTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: colors.deepBlack
  },
  socialDiscoverTagText: {
    fontSize: 13,
    fontWeight: "700"
  },
  mktChipRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md
  },
  mktFilterChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    backgroundColor: colors.deepBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  mktFilterChipText: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "800"
  },
  mktActiveFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  mktAnonToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.deepBlack,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  mktAnonToggleLabel: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "800"
  },
  mktHeroCard: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.md
  },
  mktHeroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  mktAnonBadge: {
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  mktAnonBadgeText: {
    color: colors.boneWhite,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5
  },
  mktCategoryTag: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase"
  },
  mktHeroIcon: {
    fontSize: 42,
    marginBottom: spacing.sm
  },
  mktHeroTitle: {
    color: colors.boneWhite,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 28,
    marginBottom: spacing.xs
  },
  mktHeroPrice: {
    fontSize: 18,
    fontWeight: "900",
    marginBottom: spacing.sm
  },
  mktHeroDesc: {
    color: colors.softGray,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: spacing.sm
  },
  mktSellerTag: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  mktCtaButton: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center"
  },
  mktCtaButtonText: {
    color: colors.boneWhite,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: 0.5
  },
  mktComposerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm
  },
  mktComposerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center"
  },
  mktComposerAvatarText: {
    color: colors.boneWhite,
    fontSize: 18,
    fontWeight: "900"
  },
  mktComposerInput: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    paddingHorizontal: spacing.md,
    paddingVertical: 12
  },
  mktComposerPlaceholder: {
    color: colors.mutedGray,
    fontSize: 14
  },
  mktComposerChips: {
    flexDirection: "row",
    gap: spacing.sm,
    flexWrap: "wrap"
  },
  mktListingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  mktListingCard: {
    width: "48%",
    backgroundColor: colors.cardBlack,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md
  },
  mktListingIcon: {
    fontSize: 28,
    marginBottom: spacing.xs
  },
  mktListingTitle: {
    color: colors.boneWhite,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    marginBottom: spacing.xs
  },
  mktListingPrice: {
    fontSize: 14,
    fontWeight: "900",
    marginBottom: spacing.xs
  },
  mktListingSeller: {
    color: colors.mutedGray,
    fontSize: 11,
    fontWeight: "700",
    marginBottom: spacing.sm
  },
  mktListingActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  mktLikeButton: {
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  mktLikeText: {
    color: colors.mutedGray,
    fontSize: 13,
    fontWeight: "700"
  }
});
