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
import { realmEnvironments, realms } from "./src/data/realms";
import { createEmptyContactSyncState, syncTrustedContacts } from "./src/features/contacts";
import {
  clearContactSyncCache,
  clearKeys,
  createId,
  loadBirthData,
  loadContactSyncState,
  loadJson,
  loadPersonalization,
  loadReminders,
  loadSyncedContacts,
  saveBirthData,
  saveContactSyncState,
  saveJson,
  savePersonalization,
  saveReminders,
  saveSyncedContacts,
  saveSpiritualQuestionnaire,
  loadSpiritualQuestionnaire
} from "./src/storage";
import { colors, radius, shadow, spacing } from "./src/theme";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import type {
  BetaProfile,
  BetaTab,
  BirthData,
  ContactSyncState,
  JournalEntry,
  PulsePost,
  Realm,
  RealmEnvironment,
  RealmKey,
  RealmPersonalization,
  RealmReminders,
  ReminderConfig,
  SpiritualQuestionnaire,
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
import {
  capitalise,
  elementEmoji,
  getAscendant,
  getChineseZodiac,
  getCurrentMoonPhase,
  getDailyAffirmations,
  getDailyOracleCard,
  getDailyPlanet,
  getDailyReflectionPrompt,
  getElement,
  getLifePathNumber,
  getModality,
  getSignMeta,
  getSunSign,
  getMoonSign,
  pathEmoji
} from "./src/features/astrology";

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

// ─── New default data ─────────────────────────────────────────────────────

const defaultBirthData: BirthData = {
  birthDate: "",
  birthTime: "",
  birthPlace: "",
  hemisphere: "north"
};

const defaultSpiritualQ: SpiritualQuestionnaire = {
  element: "",
  spiritualPath: "",
  intentions: [],
  affirmationStyle: "",
  practiceTime: "",
  moonPhaseAffinity: "",
  oracleDeckStyle: ""
};

const defaultPersonalization: RealmPersonalization = {
  anonymous:   { topicInterests: [], postingTone: "reflective", personaName: "" },
  social:      { feedOrder: "curated", visibilityDefault: "circle", showOnlineStatus: false },
  messaging:   { messageTheme: "vault", soundStyle: "subtle", readReceipts: false },
  marketplace: { categoryPreferences: [], anonymousOnly: true, showPriceAlerts: false },
  spiritual:   { showDailyOracle: true, showMoonPhase: true, affirmationCount: 5 },
  growth:      { focusAreas: [], habitFrequency: "daily", reflectionDepth: "guided" }
};

function makeDefaultReminder(label: string, time = "08:00"): ReminderConfig {
  return { enabled: false, time, frequency: "daily", label };
}

const defaultReminders: RealmReminders = {
  anonymous:   makeDefaultReminder("Anonymous Realm — daily check-in"),
  social:      makeDefaultReminder("Social Realm — daily stories"),
  messaging:   makeDefaultReminder("Messages — morning check"),
  marketplace: makeDefaultReminder("Marketplace — deal alerts", "09:00"),
  spiritual:   makeDefaultReminder("Spiritual — morning ritual", "07:00"),
  growth:      makeDefaultReminder("Growth — habit check-in", "20:00")
};

const accentPalette: Record<UiAccent, { primary: string; glow: string }> = {
  crimson: { primary: "#B00020", glow: "#FF1744" },
  sunset: { primary: "#D9480F", glow: "#FF7A45" },
  emerald: { primary: "#0E9F6E", glow: "#34D399" },
  electric: { primary: "#2563EB", glow: "#60A5FA" },
  amber: { primary: "#B45309", glow: "#F59E0B" }
};

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
  // ─── New personalization state ───────────────────────────────────────────
  const [birthData, setBirthData] = useState<BirthData>(defaultBirthData);
  const [spiritualQ, setSpiritualQ] = useState<SpiritualQuestionnaire>(defaultSpiritualQ);
  const [personalization, setPersonalization] = useState<RealmPersonalization>(defaultPersonalization);
  const [reminders, setReminders] = useState<RealmReminders>(defaultReminders);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      const [
        storedProfile, storedPosts, storedJournal, storedUi, storedBlend,
        storedContacts, storedContactState,
        storedBirth, storedSpiritualQ, storedPersonalization, storedReminders
      ] = await Promise.all([
        loadJson<BetaProfile | null>(STORAGE_KEYS.profile, null),
        loadJson<PulsePost[] | null>(STORAGE_KEYS.pulses, null),
        loadJson<JournalEntry[] | null>(STORAGE_KEYS.journal, null),
        loadJson<UiPreferences | null>(STORAGE_KEYS.ui, null),
        loadJson<boolean | null>(STORAGE_KEYS.blend, null),
        loadSyncedContacts(),
        loadContactSyncState(createEmptyContactSyncState()),
        loadBirthData(),
        loadSpiritualQuestionnaire(),
        loadPersonalization(defaultPersonalization),
        loadReminders(defaultReminders)
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

      if (storedBirth)        setBirthData(storedBirth);
      if (storedSpiritualQ)   setSpiritualQ(storedSpiritualQ);
      setPersonalization({ ...defaultPersonalization, ...storedPersonalization });
      setReminders({ ...defaultReminders, ...storedReminders });

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
      saveContactSyncState(contactSyncState),
      saveBirthData(birthData),
      saveSpiritualQuestionnaire(spiritualQ),
      savePersonalization(personalization),
      saveReminders(reminders)
    ]);
  }, [hydrated, profile, posts, journalEntries, uiPreferences, blendEnabled, syncedContacts, contactSyncState, birthData, spiritualQ, personalization, reminders]);

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
                birthData={birthData}
                setBirthData={setBirthData}
                spiritualQ={spiritualQ}
                setSpiritualQ={setSpiritualQ}
                personalization={personalization}
                setPersonalization={setPersonalization}
                reminders={reminders}
                setReminders={setReminders}
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

function RealmsScreen({
  profile,
  selectedRealm,
  environment,
  syncedContacts,
  contactSyncState,
  syncingContacts,
  onSyncContacts,
  setSelectedRealmKey,
  onMakeHome,
  birthData,
  setBirthData,
  spiritualQ,
  setSpiritualQ,
  personalization,
  setPersonalization,
  reminders,
  setReminders
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
  birthData: BirthData;
  setBirthData: React.Dispatch<React.SetStateAction<BirthData>>;
  spiritualQ: SpiritualQuestionnaire;
  setSpiritualQ: React.Dispatch<React.SetStateAction<SpiritualQuestionnaire>>;
  personalization: RealmPersonalization;
  setPersonalization: React.Dispatch<React.SetStateAction<RealmPersonalization>>;
  reminders: RealmReminders;
  setReminders: React.Dispatch<React.SetStateAction<RealmReminders>>;
}) {
  const ui = useUiRuntime();

  function setReminder(key: RealmKey, patch: Partial<ReminderConfig>) {
    setReminders((prev) => ({
      ...prev,
      [key]: { ...prev[key as keyof RealmReminders], ...patch }
    }));
  }

  return (
    <View>
      <SectionTitle title="The SojournX Realms" subtitle="Each realm is a different mode of being." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.realmSelector}>
        {realms.map((realm) => {
          const active = selectedRealm.key === realm.key;
          return (
            <TouchableOpacity
              key={realm.key}
              onPress={() => { ui.playUiAction(); setSelectedRealmKey(realm.key); }}
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

      {selectedRealm.key === "spiritual" ? (
        <SpiritualRealmView
          profile={profile}
          birthData={birthData}
          setBirthData={setBirthData}
          spiritualQ={spiritualQ}
          setSpiritualQ={setSpiritualQ}
          personalization={personalization.spiritual}
          setPersonalization={(p) => setPersonalization((prev) => ({ ...prev, spiritual: p }))}
          reminder={reminders.spiritual}
          setReminder={(r) => setReminder("spiritual", r)}
          onMakeHome={onMakeHome}
        />
      ) : (
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

          {/* ── Realm Personalization ── */}
          <RealmPersonalizationCard
            realmKey={selectedRealm.key}
            personalization={personalization}
            setPersonalization={setPersonalization}
          />

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
                const target = realms.find((r) => r.key === targetKey) ?? realms[0];
                return (
                  <View key={target.key} style={[styles.realmChip, { borderColor: ui.primaryColor }]}>
                    <Text style={[styles.realmChipText, { color: colors.boneWhite }]}>{target.shortTitle}</Text>
                  </View>
                );
              })}
            </View>
          </ContentCard>

          <View style={styles.featureList}>
            {selectedRealm.features.map((feature) => (
              <View key={feature} style={styles.featureRow}>
                <Text style={styles.featureBullet}>◆</Text>
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* ── Realm Reminder ── */}
          <RealmReminderCard
            reminder={reminders[selectedRealm.key as keyof RealmReminders]}
            onChange={(patch) => setReminder(selectedRealm.key, patch)}
          />

          <TouchableOpacity
            style={[styles.secondaryButton, profile.homeRealm === selectedRealm.key && styles.secondaryButtonDisabled]}
            onPress={() => onMakeHome(selectedRealm.key)}
          >
            <Text style={styles.secondaryButtonText}>
              {profile.homeRealm === selectedRealm.key ? "Home realm selected" : "Make home realm"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ContentCard>
        <Text style={styles.cardKicker}>CATEGORY</Text>
        <Text style={styles.cardTitle}>Multi-Realm Identity Platform</Text>
        <Text style={styles.bodyText}>
          SojournX Beta keeps a home realm, a preview realm, and a live profile so the category
          is measurable — not just promised.
        </Text>
      </ContentCard>
    </View>
  );
}

// ─── Realm Reminder Card ──────────────────────────────────────────────────────

function RealmReminderCard({
  reminder,
  onChange
}: {
  reminder: ReminderConfig;
  onChange: (patch: Partial<ReminderConfig>) => void;
}) {
  const ui = useUiRuntime();
  const [expanded, setExpanded] = useState(false);

  const FREQUENCIES: Array<{ value: ReminderConfig["frequency"]; label: string }> = [
    { value: "daily",    label: "Every day" },
    { value: "weekdays", label: "Weekdays" },
    { value: "weekends", label: "Weekends" },
    { value: "weekly",   label: "Weekly" },
  ];

  function requestWebNotification() {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
  }

  return (
    <ContentCard>
      <View style={styles.rpRow}>
        <View style={styles.rpLabelCol}>
          <Text style={styles.cardKicker}>REMINDER</Text>
          <Text style={styles.cardTitle}>{reminder.label}</Text>
          {reminder.enabled && (
            <Text style={[styles.rpHint, { color: ui.glowColor }]}>
              {reminder.time} · {FREQUENCIES.find((f) => f.value === reminder.frequency)?.label ?? "Daily"}
            </Text>
          )}
        </View>
        <Switch
          value={reminder.enabled}
          onValueChange={(v) => {
            ui.playUiAction();
            if (v) requestWebNotification();
            onChange({ enabled: v });
            if (v) setExpanded(true);
          }}
          trackColor={{ false: colors.borderBlack, true: ui.primaryColor }}
          thumbColor={reminder.enabled ? ui.glowColor : colors.mutedGray}
        />
      </View>

      {reminder.enabled && (
        <TouchableOpacity onPress={() => { ui.playUiAction(); setExpanded((e) => !e); }} style={styles.rpExpandBtn}>
          <Text style={[styles.rpExpandText, { color: ui.glowColor }]}>{expanded ? "▲ Fewer options" : "▼ Customize time & frequency"}</Text>
        </TouchableOpacity>
      )}

      {reminder.enabled && expanded && (
        <View style={styles.rpExpandedBlock}>
          <FieldLabel label="Time" helper="When should we remind you? (24-hour format)" />
          <TextInput
            style={[styles.input, { color: colors.boneWhite, borderColor: ui.primaryColor }]}
            value={reminder.time}
            onChangeText={(t) => onChange({ time: t })}
            placeholder="07:00"
            placeholderTextColor={colors.mutedGray}
            keyboardType="numeric"
            maxLength={5}
          />
          <FieldLabel label="Frequency" helper="How often?" />
          <View style={styles.rpFreqRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.value}
                onPress={() => { ui.playUiAction(); onChange({ frequency: f.value }); }}
                style={[
                  styles.rpFreqChip,
                  reminder.frequency === f.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }
                ]}
              >
                <Text style={[styles.rpFreqText, reminder.frequency === f.value && { color: colors.boneWhite }]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </ContentCard>
  );
}

// ─── Realm Personalization Card ───────────────────────────────────────────────

function RealmPersonalizationCard({
  realmKey,
  personalization,
  setPersonalization
}: {
  realmKey: RealmKey;
  personalization: RealmPersonalization;
  setPersonalization: React.Dispatch<React.SetStateAction<RealmPersonalization>>;
}) {
  const ui = useUiRuntime();
  const [expanded, setExpanded] = useState(false);

  function patch<K extends keyof RealmPersonalization>(
    key: K,
    value: Partial<RealmPersonalization[K]>
  ) {
    setPersonalization((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...value }
    }));
  }

  const renderContent = () => {
    if (realmKey === "anonymous") {
      const p = personalization.anonymous;
      const tones: Array<{ value: typeof p.postingTone; label: string }> = [
        { value: "reflective", label: "Reflective" },
        { value: "direct",     label: "Direct" },
        { value: "poetic",     label: "Poetic" },
        { value: "raw",        label: "Raw" },
      ];
      return (
        <>
          <FieldLabel label="Anonymous Persona Name" helper="How you appear in anonymous posts." />
          <TextInput
            style={[styles.input, { color: colors.boneWhite, borderColor: ui.primaryColor }]}
            value={p.personaName}
            onChangeText={(v) => patch("anonymous", { personaName: v })}
            placeholder="Shadow Observer"
            placeholderTextColor={colors.mutedGray}
          />
          <FieldLabel label="Posting Tone" helper="The voice that feels most you." />
          <View style={styles.rpFreqRow}>
            {tones.map((t) => (
              <TouchableOpacity
                key={t.value}
                onPress={() => { ui.playUiAction(); patch("anonymous", { postingTone: t.value }); }}
                style={[styles.rpFreqChip, p.postingTone === t.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}
              >
                <Text style={[styles.rpFreqText, p.postingTone === t.value && { color: colors.boneWhite }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }
    if (realmKey === "social") {
      const p = personalization.social;
      const orders = [
        { value: "chronological" as const, label: "Chronological" },
        { value: "curated"       as const, label: "Curated" },
        { value: "discovery"     as const, label: "Discovery" },
      ];
      const visibilities = [
        { value: "public"  as const, label: "Public" },
        { value: "circle"  as const, label: "Circle only" },
        { value: "private" as const, label: "Private" },
      ];
      return (
        <>
          <FieldLabel label="Feed Order" helper="How posts are ranked in your feed." />
          <View style={styles.rpFreqRow}>
            {orders.map((o) => (
              <TouchableOpacity key={o.value} onPress={() => { ui.playUiAction(); patch("social", { feedOrder: o.value }); }}
                style={[styles.rpFreqChip, p.feedOrder === o.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.feedOrder === o.value && { color: colors.boneWhite }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FieldLabel label="Default Visibility" helper="Who sees your posts by default." />
          <View style={styles.rpFreqRow}>
            {visibilities.map((v) => (
              <TouchableOpacity key={v.value} onPress={() => { ui.playUiAction(); patch("social", { visibilityDefault: v.value }); }}
                style={[styles.rpFreqChip, p.visibilityDefault === v.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.visibilityDefault === v.value && { color: colors.boneWhite }]}>{v.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ToggleRow label="Show online status" description="Let circle members see when you're active."
            value={p.showOnlineStatus} onValueChange={(v) => patch("social", { showOnlineStatus: v })} />
        </>
      );
    }
    if (realmKey === "messaging") {
      const p = personalization.messaging;
      const themes = [
        { value: "vault"    as const, label: "Vault" },
        { value: "midnight" as const, label: "Midnight" },
        { value: "ember"    as const, label: "Ember" },
      ];
      const sounds = [
        { value: "subtle"  as const, label: "Subtle" },
        { value: "silent"  as const, label: "Silent" },
        { value: "crystal" as const, label: "Crystal" },
      ];
      return (
        <>
          <FieldLabel label="Message Theme" helper="Visual style of the messaging chamber." />
          <View style={styles.rpFreqRow}>
            {themes.map((t) => (
              <TouchableOpacity key={t.value} onPress={() => { ui.playUiAction(); patch("messaging", { messageTheme: t.value }); }}
                style={[styles.rpFreqChip, p.messageTheme === t.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.messageTheme === t.value && { color: colors.boneWhite }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FieldLabel label="Notification Sound" helper="Sound style for incoming messages." />
          <View style={styles.rpFreqRow}>
            {sounds.map((s) => (
              <TouchableOpacity key={s.value} onPress={() => { ui.playUiAction(); patch("messaging", { soundStyle: s.value }); }}
                style={[styles.rpFreqChip, p.soundStyle === s.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.soundStyle === s.value && { color: colors.boneWhite }]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ToggleRow label="Read receipts" description="Show when you have read messages."
            value={p.readReceipts} onValueChange={(v) => patch("messaging", { readReceipts: v })} />
        </>
      );
    }
    if (realmKey === "marketplace") {
      const p = personalization.marketplace;
      return (
        <>
          <ToggleRow label="Anonymous purchases only" description="Only show listings that support anon checkout."
            value={p.anonymousOnly} onValueChange={(v) => patch("marketplace", { anonymousOnly: v })} />
          <ToggleRow label="Price drop alerts" description="Notify when watched listings drop in price."
            value={p.showPriceAlerts} onValueChange={(v) => patch("marketplace", { showPriceAlerts: v })} />
        </>
      );
    }
    if (realmKey === "growth") {
      const p = personalization.growth;
      const depths = [
        { value: "brief"   as const, label: "Brief" },
        { value: "detailed" as const, label: "Detailed" },
        { value: "guided"  as const, label: "Guided" },
      ];
      const freqs = [
        { value: "daily"  as const, label: "Daily" },
        { value: "weekly" as const, label: "Weekly" },
      ];
      return (
        <>
          <FieldLabel label="Reflection Depth" helper="How deep you want your journal prompts to go." />
          <View style={styles.rpFreqRow}>
            {depths.map((d) => (
              <TouchableOpacity key={d.value} onPress={() => { ui.playUiAction(); patch("growth", { reflectionDepth: d.value }); }}
                style={[styles.rpFreqChip, p.reflectionDepth === d.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.reflectionDepth === d.value && { color: colors.boneWhite }]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <FieldLabel label="Habit Frequency" helper="How often habits are tracked." />
          <View style={styles.rpFreqRow}>
            {freqs.map((f) => (
              <TouchableOpacity key={f.value} onPress={() => { ui.playUiAction(); patch("growth", { habitFrequency: f.value }); }}
                style={[styles.rpFreqChip, p.habitFrequency === f.value && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}>
                <Text style={[styles.rpFreqText, p.habitFrequency === f.value && { color: colors.boneWhite }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }
    return null;
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <ContentCard>
      <TouchableOpacity onPress={() => { ui.playUiAction(); setExpanded((e) => !e); }} style={styles.rpRow}>
        <View style={styles.rpLabelCol}>
          <Text style={styles.cardKicker}>PERSONALIZATION</Text>
          <Text style={styles.cardTitle}>Customize this realm</Text>
        </View>
        <Text style={[styles.rpExpandText, { color: ui.glowColor }]}>{expanded ? "▲" : "▼"}</Text>
      </TouchableOpacity>
      {expanded && <View style={{ marginTop: spacing.sm }}>{content}</View>}
    </ContentCard>
  );
}

// ─── Spiritual Realm View ─────────────────────────────────────────────────────

type SpiritualPersonalization = RealmPersonalization["spiritual"];

function SpiritualRealmView({
  profile,
  birthData,
  setBirthData,
  spiritualQ,
  setSpiritualQ,
  personalization,
  setPersonalization,
  reminder,
  setReminder,
  onMakeHome
}: {
  profile: BetaProfile;
  birthData: BirthData;
  setBirthData: React.Dispatch<React.SetStateAction<BirthData>>;
  spiritualQ: SpiritualQuestionnaire;
  setSpiritualQ: React.Dispatch<React.SetStateAction<SpiritualQuestionnaire>>;
  personalization: SpiritualPersonalization;
  setPersonalization: (p: SpiritualPersonalization) => void;
  reminder: ReminderConfig;
  setReminder: (patch: Partial<ReminderConfig>) => void;
  onMakeHome: (key: RealmKey) => void;
}) {
  const ui = useUiRuntime();
  const [step, setStep] = useState<"chart" | "birth" | "questionnaire">("chart");

  const hasBirth = Boolean(birthData.birthDate);
  const hasQ     = Boolean(spiritualQ.element || spiritualQ.spiritualPath);

  // Derived astrology
  const sunSign   = hasBirth ? getSunSign(birthData.birthDate)              : null;
  const moonSign  = hasBirth ? getMoonSign(birthData.birthDate)              : null;
  const rising    = hasBirth && birthData.birthTime ? getAscendant(birthData.birthTime, birthData.birthDate) : null;
  const element   = sunSign ? getElement(sunSign)                           : null;
  const modality  = sunSign ? getModality(sunSign)                          : null;
  const signMeta  = sunSign ? getSignMeta(sunSign)                          : null;
  const lifePathN = hasBirth ? getLifePathNumber(birthData.birthDate)        : null;
  const birthYear = hasBirth ? new Date(birthData.birthDate).getUTCFullYear() : null;
  const chinese   = birthYear ? getChineseZodiac(birthYear)                  : null;
  const moonPhase = getCurrentMoonPhase();
  const dailyPlanet = getDailyPlanet();
  const oracleCard  = personalization.showDailyOracle
    ? getDailyOracleCard(spiritualQ.oracleDeckStyle || "celestial")
    : null;
  const affirmations = (hasBirth || hasQ)
    ? getDailyAffirmations(spiritualQ, birthData.birthDate || "1990-01-01", personalization.affirmationCount)
    : [];
  const reflectionPrompt = getDailyReflectionPrompt(spiritualQ.spiritualPath);

  const INTENTIONS: Array<{ value: SpiritualQuestionnaire["intentions"][number]; label: string }> = [
    { value: "love",       label: "Love & Relationships" },
    { value: "purpose",    label: "Purpose & Career" },
    { value: "health",     label: "Health & Body" },
    { value: "grief",      label: "Grief & Loss" },
    { value: "identity",   label: "Identity & Self" },
    { value: "abundance",  label: "Abundance & Manifestation" },
    { value: "clarity",    label: "Clarity & Direction" },
    { value: "protection", label: "Protection & Safety" },
    { value: "creativity", label: "Creativity & Expression" },
    { value: "peace",      label: "Peace & Stillness" },
  ];

  function toggleIntention(val: SpiritualQuestionnaire["intentions"][number]) {
    ui.playUiAction();
    setSpiritualQ((prev) => {
      const has = prev.intentions.includes(val);
      if (has) return { ...prev, intentions: prev.intentions.filter((i) => i !== val) };
      if (prev.intentions.length >= 3) return prev;
      return { ...prev, intentions: [...prev.intentions, val] };
    });
  }

  return (
    <View>
      {/* ── Header ── */}
      <View style={[styles.spirHeader, { borderColor: ui.primaryColor }]}>
        <Text style={[styles.spirHeaderIcon, { color: ui.glowColor }]}>☽✦☾</Text>
        <Text style={styles.spirHeaderTitle}>Spiritual Realm</Text>
        <Text style={[styles.spirHeaderSub, { color: ui.glowColor }]}>
          {profile.displayName ? `Welcome, ${profile.displayName}` : "Where inner work becomes sacred practice"}
        </Text>
      </View>

      {/* ── Step tabs ── */}
      <View style={styles.spirTabRow}>
        {([
          { key: "chart",         label: "✦ Daily Chart" },
          { key: "birth",         label: "☽ Birth Data" },
          { key: "questionnaire", label: "◈ Soul Profile" },
        ] as const).map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => { ui.playUiAction(); setStep(t.key); }}
            style={[styles.spirTab, step === t.key && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}
          >
            <Text style={[styles.spirTabText, step === t.key && { color: colors.boneWhite }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ════════════════ BIRTH DATA STEP ════════════════ */}
      {step === "birth" && (
        <View>
          <ContentCard>
            <Text style={styles.cardKicker}>BIRTH CHART DATA</Text>
            <Text style={styles.cardTitle}>Enter your birth details</Text>
            <Text style={styles.bodyText}>
              Your birth data powers your personal chart — sun sign, moon sign, rising, life path number, and more.
              All data stays on your device.
            </Text>

            <FieldLabel label="Date of Birth" helper="Format: YYYY-MM-DD  (e.g. 1993-08-14)" />
            <TextInput
              style={[styles.input, { color: colors.boneWhite, borderColor: ui.primaryColor }]}
              value={birthData.birthDate}
              onChangeText={(v) => setBirthData((p) => ({ ...p, birthDate: v }))}
              placeholder="1993-08-14"
              placeholderTextColor={colors.mutedGray}
              keyboardType="numeric"
            />

            <FieldLabel label="Time of Birth" helper="24-hour format (e.g. 14:30). Enables Rising sign." />
            <TextInput
              style={[styles.input, { color: colors.boneWhite, borderColor: ui.primaryColor }]}
              value={birthData.birthTime}
              onChangeText={(v) => setBirthData((p) => ({ ...p, birthTime: v }))}
              placeholder="14:30"
              placeholderTextColor={colors.mutedGray}
              keyboardType="numeric"
              maxLength={5}
            />

            <FieldLabel label="Birth Place" helper="City and country (optional — for future regional features)." />
            <TextInput
              style={[styles.input, { color: colors.boneWhite, borderColor: ui.primaryColor }]}
              value={birthData.birthPlace}
              onChangeText={(v) => setBirthData((p) => ({ ...p, birthPlace: v }))}
              placeholder="Los Angeles, USA"
              placeholderTextColor={colors.mutedGray}
            />

            <FieldLabel label="Hemisphere" helper="Affects seasonal interpretation of your chart." />
            <View style={styles.rpFreqRow}>
              {(["north", "south"] as const).map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => { ui.playUiAction(); setBirthData((p) => ({ ...p, hemisphere: h })); }}
                  style={[styles.rpFreqChip, birthData.hemisphere === h && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}
                >
                  <Text style={[styles.rpFreqText, birthData.hemisphere === h && { color: colors.boneWhite }]}>
                    {h === "north" ? "Northern" : "Southern"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          {hasBirth && (
            <ContentCard>
              <Text style={[styles.cardKicker, { color: ui.glowColor }]}>CHART PREVIEW</Text>
              <View style={styles.spirChartRow}>
                <SpiritualChip label="Sun" value={sunSign ? capitalise(sunSign) : "—"} glyph={signMeta?.glyph ?? "✦"} glowColor={ui.glowColor} />
                <SpiritualChip label="Moon" value={moonSign ? capitalise(moonSign) : "—"} glyph="☽" glowColor={ui.glowColor} />
                {rising && <SpiritualChip label="Rising" value={capitalise(rising)} glyph="↑" glowColor={ui.glowColor} />}
                <SpiritualChip label="Element" value={element ? capitalise(element) : "—"} glyph={elementEmoji(element ?? "")} glowColor={ui.glowColor} />
                {lifePathN && <SpiritualChip label="Life Path" value={String(lifePathN)} glyph="#" glowColor={ui.glowColor} />}
                {chinese && <SpiritualChip label="Chinese" value={`${chinese.element} ${chinese.animal}`} glyph="🐲" glowColor={ui.glowColor} />}
              </View>
              <TouchableOpacity onPress={() => { ui.playUiAction(); setStep("chart"); }} style={[styles.spirViewChartBtn, { borderColor: ui.glowColor }]}>
                <Text style={[styles.spirViewChartText, { color: ui.glowColor }]}>View your full daily chart →</Text>
              </TouchableOpacity>
            </ContentCard>
          )}
        </View>
      )}

      {/* ════════════════ QUESTIONNAIRE STEP ════════════════ */}
      {step === "questionnaire" && (
        <View>
          <ContentCard>
            <Text style={styles.cardKicker}>SOUL PROFILE</Text>
            <Text style={styles.cardTitle}>Shape your spiritual experience</Text>
            <Text style={styles.bodyText}>
              Your answers personalize daily affirmations, oracle readings, and reflection prompts.
              There are no wrong answers here.
            </Text>
          </ContentCard>

          {/* Q1: Element */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 1 OF 6 · YOUR ELEMENT</Text>
            <Text style={styles.cardTitle}>Which element calls to you?</Text>
            <View style={styles.spirQGrid}>
              {([
                { value: "fire",  label: "🔥 Fire",  sub: "Passion, courage, transformation" },
                { value: "earth", label: "🌍 Earth", sub: "Stability, patience, abundance" },
                { value: "air",   label: "💨 Air",   sub: "Clarity, freedom, communication" },
                { value: "water", label: "💧 Water", sub: "Depth, intuition, healing" },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { ui.playUiAction(); setSpiritualQ((p) => ({ ...p, element: opt.value })); }}
                  style={[styles.spirQOption, spiritualQ.element === opt.value && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                >
                  <Text style={[styles.spirQOptionLabel, spiritualQ.element === opt.value && { color: ui.glowColor }]}>{opt.label}</Text>
                  <Text style={styles.spirQOptionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          {/* Q2: Spiritual Path */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 2 OF 6 · YOUR PATH</Text>
            <Text style={styles.cardTitle}>What is your spiritual role?</Text>
            <View style={styles.spirQGrid}>
              {([
                { value: "seeker",  label: "🔍 The Seeker",   sub: "Driven by questions and truth" },
                { value: "mystic",  label: "🌀 The Mystic",   sub: "Walks between worlds" },
                { value: "warrior", label: "⚔️ The Warrior",  sub: "Protects what is sacred" },
                { value: "healer",  label: "💚 The Healer",   sub: "Channels love and restoration" },
                { value: "sage",    label: "📜 The Sage",     sub: "Holds ancient wisdom" },
                { value: "creator", label: "✨ The Creator",  sub: "Co-creates with the universe" },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { ui.playUiAction(); setSpiritualQ((p) => ({ ...p, spiritualPath: opt.value })); }}
                  style={[styles.spirQOption, spiritualQ.spiritualPath === opt.value && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                >
                  <Text style={[styles.spirQOptionLabel, spiritualQ.spiritualPath === opt.value && { color: ui.glowColor }]}>{opt.label}</Text>
                  <Text style={styles.spirQOptionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          {/* Q3: Intentions */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 3 OF 6 · YOUR INTENTIONS</Text>
            <Text style={styles.cardTitle}>What are you working through? <Text style={styles.bodyText}>(Choose up to 3)</Text></Text>
            <View style={styles.spirQGrid}>
              {INTENTIONS.map((opt) => {
                const selected = spiritualQ.intentions.includes(opt.value);
                return (
                  <TouchableOpacity
                    key={opt.value}
                    onPress={() => toggleIntention(opt.value)}
                    style={[styles.spirQOptionSmall, selected && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                  >
                    <Text style={[styles.spirQOptionLabel, selected && { color: ui.glowColor }]}>{opt.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ContentCard>

          {/* Q4: Affirmation Style */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 4 OF 6 · AFFIRMATION STYLE</Text>
            <Text style={styles.cardTitle}>How do you want to be spoken to?</Text>
            <View style={styles.spirQGrid}>
              {([
                { value: "gentle", label: "🌿 Gentle",  sub: "Soft, nurturing, encouraging" },
                { value: "bold",   label: "⚡ Bold",    sub: "Activating, fierce, direct" },
                { value: "poetic", label: "🌙 Poetic",  sub: "Mystical, lyrical, cosmic" },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { ui.playUiAction(); setSpiritualQ((p) => ({ ...p, affirmationStyle: opt.value })); }}
                  style={[styles.spirQOption, spiritualQ.affirmationStyle === opt.value && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                >
                  <Text style={[styles.spirQOptionLabel, spiritualQ.affirmationStyle === opt.value && { color: ui.glowColor }]}>{opt.label}</Text>
                  <Text style={styles.spirQOptionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          {/* Q5: Practice Time */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 5 OF 6 · PRACTICE TIME</Text>
            <Text style={styles.cardTitle}>When do you most need spiritual guidance?</Text>
            <View style={styles.spirQGrid}>
              {([
                { value: "morning",  label: "☀️ Morning",  sub: "Set intentions at dawn" },
                { value: "evening",  label: "🌙 Evening",  sub: "Reflect and release at dusk" },
                { value: "flexible", label: "✦ Flexible",  sub: "Whenever the spirit calls" },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { ui.playUiAction(); setSpiritualQ((p) => ({ ...p, practiceTime: opt.value })); }}
                  style={[styles.spirQOption, spiritualQ.practiceTime === opt.value && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                >
                  <Text style={[styles.spirQOptionLabel, spiritualQ.practiceTime === opt.value && { color: ui.glowColor }]}>{opt.label}</Text>
                  <Text style={styles.spirQOptionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          {/* Q6: Oracle Deck */}
          <ContentCard>
            <Text style={styles.cardKicker}>STEP 6 OF 6 · ORACLE DECK</Text>
            <Text style={styles.cardTitle}>Choose your oracle deck style</Text>
            <View style={styles.spirQGrid}>
              {([
                { value: "cosmic",    label: "✦ Cosmic",    sub: "Stars, voids, and stellar forces" },
                { value: "nature",    label: "🌿 Nature",   sub: "Elements, seasons, and earth wisdom" },
                { value: "shadow",    label: "◼ Shadow",    sub: "Deep psychology and integration" },
                { value: "celestial", label: "🌙 Celestial", sub: "Planets, moons, and archetypes" },
              ] as const).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => { ui.playUiAction(); setSpiritualQ((p) => ({ ...p, oracleDeckStyle: opt.value })); }}
                  style={[styles.spirQOption, spiritualQ.oracleDeckStyle === opt.value && { borderColor: ui.glowColor, backgroundColor: ui.primaryColor + "33" }]}
                >
                  <Text style={[styles.spirQOptionLabel, spiritualQ.oracleDeckStyle === opt.value && { color: ui.glowColor }]}>{opt.label}</Text>
                  <Text style={styles.spirQOptionSub}>{opt.sub}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ContentCard>

          <TouchableOpacity
            onPress={() => { ui.playUiAction(); setStep("chart"); }}
            style={[styles.primaryButton, { backgroundColor: ui.primaryColor, marginHorizontal: 0 }]}
          >
            <Text style={styles.primaryButtonText}>View my personalized chart →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ════════════════ DAILY CHART STEP ════════════════ */}
      {step === "chart" && (
        <View>
          {/* Birth chart summary */}
          {hasBirth ? (
            <ContentCard>
              <Text style={styles.cardKicker}>YOUR NATAL BLUEPRINT</Text>
              <View style={styles.spirChartRow}>
                <SpiritualChip label="Sun" value={capitalise(sunSign!)} glyph={signMeta?.glyph ?? "☉"} glowColor={ui.glowColor} />
                <SpiritualChip label="Moon" value={capitalise(moonSign!)} glyph="☽" glowColor={ui.glowColor} />
                {rising && <SpiritualChip label="Rising" value={capitalise(rising)} glyph="↑" glowColor={ui.glowColor} />}
                <SpiritualChip label="Element" value={capitalise(element!)} glyph={elementEmoji(element!)} glowColor={ui.glowColor} />
                <SpiritualChip label="Modality" value={modality!} glyph="◈" glowColor={ui.glowColor} />
                {lifePathN !== null && <SpiritualChip label="Life Path" value={String(lifePathN)} glyph="#" glowColor={ui.glowColor} />}
                {chinese && <SpiritualChip label="Chinese" value={`${chinese.element} ${chinese.animal}`} glyph="☯" glowColor={ui.glowColor} />}
              </View>
              {signMeta && (
                <View style={{ marginTop: spacing.sm }}>
                  <Text style={[styles.cardKicker, { marginTop: spacing.xs }]}>SUN SIGN ESSENCE</Text>
                  <Text style={styles.cardTitle}>{signMeta.glyph} {capitalise(sunSign!)} · ruled by {signMeta.ruling}</Text>
                  <View style={styles.spirKeywordsRow}>
                    {signMeta.keywords.map((kw) => (
                      <View key={kw} style={[styles.spirKeyword, { borderColor: ui.primaryColor }]}>
                        <Text style={[styles.spirKeywordText, { color: ui.glowColor }]}>{kw}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.bodyText}>
                    <Text style={{ color: colors.mutedGray }}>Shadow work: </Text>{signMeta.shadow}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => { ui.playUiAction(); setStep("birth"); }}
                style={{ marginTop: spacing.sm }}
              >
                <Text style={[styles.rpHint, { color: ui.glowColor }]}>Edit birth data →</Text>
              </TouchableOpacity>
            </ContentCard>
          ) : (
            <ContentCard>
              <Text style={styles.cardKicker}>BIRTH CHART</Text>
              <Text style={styles.cardTitle}>Enter your birth data for a personal chart</Text>
              <Text style={styles.bodyText}>
                Add your birth date, time, and place to unlock your sun sign, moon sign, rising, life path number,
                and Chinese zodiac — all calculated privately on your device.
              </Text>
              <TouchableOpacity
                onPress={() => { ui.playUiAction(); setStep("birth"); }}
                style={[styles.secondaryButton, { borderColor: ui.glowColor }]}
              >
                <Text style={[styles.secondaryButtonText, { color: ui.glowColor }]}>Enter birth data →</Text>
              </TouchableOpacity>
            </ContentCard>
          )}

          {/* Soul profile summary */}
          {hasQ && (
            <ContentCard>
              <Text style={styles.cardKicker}>YOUR SOUL PROFILE</Text>
              <View style={styles.spirChartRow}>
                {spiritualQ.element    && <SpiritualChip label="Element" value={capitalise(spiritualQ.element)} glyph={elementEmoji(spiritualQ.element)} glowColor={ui.glowColor} />}
                {spiritualQ.spiritualPath && <SpiritualChip label="Path" value={capitalise(spiritualQ.spiritualPath)} glyph={pathEmoji(spiritualQ.spiritualPath)} glowColor={ui.glowColor} />}
                {spiritualQ.affirmationStyle && <SpiritualChip label="Voice" value={capitalise(spiritualQ.affirmationStyle)} glyph="◈" glowColor={ui.glowColor} />}
                {spiritualQ.practiceTime  && <SpiritualChip label="Practice" value={capitalise(spiritualQ.practiceTime)} glyph="☽" glowColor={ui.glowColor} />}
              </View>
              {spiritualQ.intentions.length > 0 && (
                <View style={styles.spirKeywordsRow}>
                  {spiritualQ.intentions.map((i) => (
                    <View key={i} style={[styles.spirKeyword, { borderColor: ui.primaryColor }]}>
                      <Text style={[styles.spirKeywordText, { color: ui.glowColor }]}>{capitalise(i)}</Text>
                    </View>
                  ))}
                </View>
              )}
              <TouchableOpacity onPress={() => { ui.playUiAction(); setStep("questionnaire"); }} style={{ marginTop: spacing.sm }}>
                <Text style={[styles.rpHint, { color: ui.glowColor }]}>Edit soul profile →</Text>
              </TouchableOpacity>
            </ContentCard>
          )}

          {!hasQ && (
            <ContentCard>
              <Text style={styles.cardKicker}>SOUL PROFILE</Text>
              <Text style={styles.cardTitle}>Personalize your spiritual guidance</Text>
              <Text style={styles.bodyText}>
                Answer 6 short questions to shape your daily affirmations, oracle readings, and reflection prompts.
              </Text>
              <TouchableOpacity
                onPress={() => { ui.playUiAction(); setStep("questionnaire"); }}
                style={[styles.secondaryButton, { borderColor: ui.glowColor }]}
              >
                <Text style={[styles.secondaryButtonText, { color: ui.glowColor }]}>Begin soul questionnaire →</Text>
              </TouchableOpacity>
            </ContentCard>
          )}

          {/* Moon Phase */}
          {personalization.showMoonPhase && (
            <ContentCard>
              <Text style={styles.cardKicker}>CURRENT MOON PHASE</Text>
              <View style={styles.spirMoonRow}>
                <Text style={styles.spirMoonEmoji}>{moonPhase.emoji}</Text>
                <View style={styles.spirMoonInfo}>
                  <Text style={[styles.cardTitle, { color: ui.glowColor }]}>{moonPhase.label}</Text>
                  <Text style={styles.bodyText}>{moonPhase.meaning}</Text>
                </View>
              </View>
            </ContentCard>
          )}

          {/* Planetary influence */}
          <ContentCard>
            <Text style={styles.cardKicker}>TODAY&apos;S PLANETARY INFLUENCE</Text>
            <Text style={[styles.cardTitle, { color: ui.glowColor }]}>✦ {dailyPlanet.planet}</Text>
            <Text style={styles.bodyText}>{dailyPlanet.message}</Text>
          </ContentCard>

          {/* Daily Affirmations */}
          {affirmations.length > 0 && (
            <ContentCard>
              <Text style={styles.cardKicker}>YOUR DAILY AFFIRMATIONS</Text>
              <Text style={styles.cardTitle}>
                {hasBirth && sunSign ? `${capitalise(sunSign)} — ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric" })}` : "Today's affirmations"}
              </Text>
              {affirmations.map((aff, idx) => (
                <View key={idx} style={styles.spirAffirmRow}>
                  <Text style={[styles.spirAffirmBullet, { color: ui.glowColor }]}>✦</Text>
                  <Text style={styles.spirAffirmText}>{aff}</Text>
                </View>
              ))}
              {/* Affirmation count selector */}
              <View style={[styles.rpFreqRow, { marginTop: spacing.sm }]}>
                {([3, 5, 7] as const).map((n) => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => { ui.playUiAction(); setPersonalization({ ...personalization, affirmationCount: n }); }}
                    style={[styles.rpFreqChip, personalization.affirmationCount === n && { backgroundColor: ui.primaryColor, borderColor: ui.glowColor }]}
                  >
                    <Text style={[styles.rpFreqText, personalization.affirmationCount === n && { color: colors.boneWhite }]}>{n} affirmations</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ContentCard>
          )}

          {/* Oracle Card */}
          {personalization.showDailyOracle && oracleCard && (
            <ContentCard>
              <Text style={styles.cardKicker}>TODAY&apos;S ORACLE</Text>
              <View style={styles.spirOracleCard}>
                <Text style={styles.spirOracleEmoji}>{oracleCard.emoji}</Text>
                <Text style={[styles.spirOracleName, { color: ui.glowColor }]}>{oracleCard.name}</Text>
                <View style={[styles.spirOracleMeaningBadge, { borderColor: ui.primaryColor }]}>
                  <Text style={styles.spirOracleMeaning}>{oracleCard.meaning}</Text>
                </View>
              </View>
              <Text style={styles.spirOracleGuidance}>{oracleCard.guidance}</Text>
              {oracleCard.reversed && (
                <Text style={styles.bodyText}>
                  <Text style={{ color: colors.mutedGray }}>Shadow reading: </Text>{oracleCard.reversed}
                </Text>
              )}
            </ContentCard>
          )}

          {/* Daily Reflection Prompt */}
          <ContentCard>
            <Text style={styles.cardKicker}>SACRED QUESTION</Text>
            <Text style={[styles.cardTitle, { color: ui.glowColor }]}>◈ For today&apos;s reflection</Text>
            <Text style={[styles.spirReflectionPrompt]}>{reflectionPrompt}</Text>
          </ContentCard>

          {/* Personalization toggles */}
          <ContentCard>
            <Text style={styles.cardKicker}>PERSONALIZATION</Text>
            <Text style={styles.cardTitle}>Customize your spiritual view</Text>
            <ToggleRow
              label="Show daily oracle card"
              description="Receive a new oracle reading each day."
              value={personalization.showDailyOracle}
              onValueChange={(v) => setPersonalization({ ...personalization, showDailyOracle: v })}
            />
            <ToggleRow
              label="Show moon phase"
              description="Display current lunar phase and its spiritual meaning."
              value={personalization.showMoonPhase}
              onValueChange={(v) => setPersonalization({ ...personalization, showMoonPhase: v })}
            />
          </ContentCard>

          {/* Reminder */}
          <RealmReminderCard reminder={reminder} onChange={setReminder} />

          <TouchableOpacity
            style={[styles.secondaryButton, profile.homeRealm === "spiritual" && styles.secondaryButtonDisabled]}
            onPress={() => onMakeHome("spiritual")}
          >
            <Text style={styles.secondaryButtonText}>
              {profile.homeRealm === "spiritual" ? "Home realm selected" : "Make home realm"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SpiritualChip({
  label,
  value,
  glyph,
  glowColor
}: {
  label: string;
  value: string;
  glyph: string;
  glowColor: string;
}) {
  return (
    <View style={styles.spirChip}>
      <Text style={[styles.spirChipGlyph, { color: glowColor }]}>{glyph}</Text>
      <Text style={styles.spirChipLabel}>{label}</Text>
      <Text style={styles.spirChipValue}>{value}</Text>
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

  // ─── Spiritual Realm ────────────────────────────────────────────────────
  spirHeader: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginBottom: spacing.md,
    backgroundColor: "rgba(99,102,241,0.08)"
  },
  spirHeaderIcon: {
    fontSize: 28,
    letterSpacing: 6,
    marginBottom: spacing.xs
  },
  spirHeaderTitle: {
    color: colors.boneWhite,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1
  },
  spirHeaderSub: {
    fontSize: 13,
    marginTop: spacing.xs,
    textAlign: "center"
  },
  spirTabRow: {
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.md
  },
  spirTab: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    alignItems: "center"
  },
  spirTabText: {
    color: colors.mutedGray,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center"
  },
  spirChartRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  spirChip: {
    backgroundColor: colors.cardBlack,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center",
    minWidth: 72
  },
  spirChipGlyph: {
    fontSize: 16,
    marginBottom: 2
  },
  spirChipLabel: {
    color: colors.mutedGray,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  spirChipValue: {
    color: colors.boneWhite,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  spirKeywordsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  spirKeyword: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4
  },
  spirKeywordText: {
    fontSize: 11,
    fontWeight: "700"
  },
  spirQGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  spirQOption: {
    width: "48%",
    borderWidth: 1,
    borderColor: colors.borderBlack,
    borderRadius: radius.md,
    padding: spacing.sm,
    backgroundColor: colors.cardBlack
  },
  spirQOptionSmall: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    borderRadius: radius.sm,
    backgroundColor: colors.cardBlack
  },
  spirQOptionLabel: {
    color: colors.boneWhite,
    fontSize: 13,
    fontWeight: "700"
  },
  spirQOptionSub: {
    color: colors.mutedGray,
    fontSize: 11,
    marginTop: 3
  },
  spirMoonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm
  },
  spirMoonEmoji: {
    fontSize: 40
  },
  spirMoonInfo: {
    flex: 1
  },
  spirAffirmRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
    alignItems: "flex-start"
  },
  spirAffirmBullet: {
    fontSize: 14,
    marginTop: 2
  },
  spirAffirmText: {
    flex: 1,
    color: colors.boneWhite,
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic"
  },
  spirOracleCard: {
    alignItems: "center",
    paddingVertical: spacing.md,
    gap: spacing.xs
  },
  spirOracleEmoji: {
    fontSize: 52
  },
  spirOracleName: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1
  },
  spirOracleMeaningBadge: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    marginTop: 4
  },
  spirOracleMeaning: {
    color: colors.mutedGray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  spirOracleGuidance: {
    color: colors.boneWhite,
    fontSize: 15,
    lineHeight: 24,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm
  },
  spirReflectionPrompt: {
    color: colors.boneWhite,
    fontSize: 17,
    lineHeight: 28,
    fontStyle: "italic",
    marginTop: spacing.sm
  },
  spirViewChartBtn: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: "center",
    marginTop: spacing.sm
  },
  spirViewChartText: {
    fontSize: 13,
    fontWeight: "700"
  },

  // ─── Personalization & Reminder shared ──────────────────────────────────
  rpRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  rpLabelCol: {
    flex: 1,
    marginRight: spacing.sm
  },
  rpHint: {
    fontSize: 12,
    marginTop: spacing.xs
  },
  rpExpandBtn: {
    marginTop: spacing.sm
  },
  rpExpandText: {
    fontSize: 12,
    fontWeight: "700"
  },
  rpExpandedBlock: {
    marginTop: spacing.sm
  },
  rpFreqRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  rpFreqChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderBlack,
    backgroundColor: colors.cardBlack
  },
  rpFreqText: {
    color: colors.mutedGray,
    fontSize: 12,
    fontWeight: "600"
  }
});
