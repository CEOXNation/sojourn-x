import { Audio } from "expo-av";
import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Alert,
  Easing,
  Image,
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
import { clearKeys, createId, loadJson, saveJson } from "./src/storage";
import { colors, radius, shadow, spacing } from "./src/theme";
import type {
  BetaProfile,
  BetaTab,
  JournalEntry,
  PulsePost,
  Realm,
  RealmEnvironment,
  RealmKey,
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
  pronouns: "they/them",
  bio: "",
  location: "",
  website: "",
  homeRealm: "anonymous",
  privateMode: true,
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
  anonymous: { background: "#090A12", wash: "rgba(118,88,255,0.16)", orb: "#6D28D9" },
  social: { background: "#0D0B12", wash: "rgba(255,111,97,0.18)", orb: "#EA580C" },
  messaging: { background: "#071015", wash: "rgba(56,189,248,0.17)", orb: "#0284C7" },
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
  const [pulseBody, setPulseBody] = useState("");
  const [pulseMood, setPulseMood] = useState(defaultPulseMood);
  const [pulseRealmKey, setPulseRealmKey] = useState<RealmKey>(defaultProfile.homeRealm);
  const [journalBody, setJournalBody] = useState("");
  const [journalMood, setJournalMood] = useState(betaMoods[1]);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      const [storedProfile, storedPosts, storedJournal, storedUi, storedBlend] = await Promise.all([
        loadJson<BetaProfile | null>(STORAGE_KEYS.profile, null),
        loadJson<PulsePost[] | null>(STORAGE_KEYS.pulses, null),
        loadJson<JournalEntry[] | null>(STORAGE_KEYS.journal, null),
        loadJson<UiPreferences | null>(STORAGE_KEYS.ui, null),
        loadJson<boolean | null>(STORAGE_KEYS.blend, null)
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
      saveJson(STORAGE_KEYS.blend, blendEnabled)
    ]);
  }, [hydrated, profile, posts, journalEntries, uiPreferences, blendEnabled]);

  useEffect(() => {
    setPulseRealmKey(profile.homeRealm);
    setSelectedRealmKey(profile.homeRealm);
  }, [profile.homeRealm]);

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
              />
            )}

            {activeTab === "Settings" && (
              <SettingsScreen
                profile={profile}
                setProfile={setProfile}
                onReset={() => {
                Alert.alert(
                  "Reset local vault?",
                  "This clears the beta profile, pulse feed, and journal from this device.",
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
                        setProfile(defaultProfile);
                        setPosts(betaPulseSeed);
                        setJournalEntries(betaJournalSeed);
                        setUiPreferences(defaultUiPreferences);
                        setBlendEnabled(true);
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

  return <UiRuntimeContext.Provider value={uiRuntime}>{content}</UiRuntimeContext.Provider>;
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
  onJump
}: {
  profile: BetaProfile;
  betaMetrics: Array<{ label: string; value: string }>;
  homeRealm: Realm;
  posts: PulsePost[];
  journalEntries: JournalEntry[];
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
  setSelectedRealmKey,
  onMakeHome
}: {
  profile: BetaProfile;
  selectedRealm: Realm;
  environment: RealmEnvironment;
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
  entries
}: {
  profile: BetaProfile;
  setProfile: React.Dispatch<React.SetStateAction<BetaProfile>>;
  posts: PulsePost[];
  entries: JournalEntry[];
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
  onReset
}: {
  profile: BetaProfile;
  setProfile: React.Dispatch<React.SetStateAction<BetaProfile>>;
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
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
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
  }
});