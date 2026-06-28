import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { anonymousPosts, growthSignals, marketItems, privateMessages, realms } from "./src/data/realms";
import { colors, radius, shadow, spacing } from "./src/theme";
import type { NavTab, Realm } from "./src/types";

const navTabs: NavTab[] = ["Vault", "Realms", "Messages", "Market", "Growth"];

export default function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [activeTab, setActiveTab] = useState<NavTab>("Vault");
  const [selectedRealm, setSelectedRealm] = useState<Realm>(realms[0]);

  if (!hasEntered) {
    return <AgeGate onEnter={() => setHasEntered(true)} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.appShell}>
        <Header />
        <Nav activeTab={activeTab} setActiveTab={setActiveTab} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          {activeTab === "Vault" && <VaultHome />}
          {activeTab === "Realms" && (
            <RealmsScreen selectedRealm={selectedRealm} setSelectedRealm={setSelectedRealm} />
          )}
          {activeTab === "Messages" && <MessagesScreen />}
          {activeTab === "Market" && <MarketplaceScreen />}
          {activeTab === "Growth" && <GrowthScreen />}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function AgeGate({ onEnter }: { onEnter: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.ageGate}>
        <View style={styles.glowOrb} />
        <Text style={styles.logoMark}>X</Text>
        <Text style={styles.title}>SojournX</Text>
        <Text style={styles.tagline}>Every version of you has a realm.</Text>

        <View style={styles.ageCard}>
          <Text style={styles.ageTitle}>Enter the Vault</Text>
          <Text style={styles.bodyText}>
            SojournX is designed as an adults-only digital sanctuary for private identity, expression,
            reflection, and connection.
          </Text>
          <Text style={styles.disclaimer}>
            By entering, you confirm that you are 18+ and agree to use the platform respectfully.
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onEnter}>
            <Text style={styles.primaryButtonText}>I am 18+ - Enter SojournX</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Prototype only. Production privacy, encryption, moderation, and legal systems must be
          implemented before launch.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.brand}>SojournX</Text>
        <Text style={styles.headerSub}>Multi-Realm Identity Platform</Text>
      </View>

      <View style={styles.vaultBadge}>
        <Text style={styles.vaultBadgeText}>VAULT</Text>
      </View>
    </View>
  );
}

function Nav({
  activeTab,
  setActiveTab
}: {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}) {
  return (
    <View style={styles.nav}>
      {navTabs.map((tab) => {
        const active = tab === activeTab;

        return (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.navItem, active && styles.navItemActive]}
          >
            <Text style={[styles.navText, active && styles.navTextActive]}>{tab}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function VaultHome() {
  const featured = useMemo(() => realms.slice(0, 3), []);

  return (
    <View>
      <HeroCard />
      <SectionTitle title="Your Realms" subtitle="Shift identity modes without leaving the sanctuary." />

      <View style={styles.realmGrid}>
        {featured.map((realm) => (
          <SmallRealmCard key={realm.key} realm={realm} />
        ))}
      </View>

      <SectionTitle title="Anonymous Pulse" subtitle="A glimpse inside the shadow forum." />

      {anonymousPosts.map((post) => (
        <ContentCard key={post.title}>
          <Text style={styles.cardKicker}>{post.community}</Text>
          <Text style={styles.cardTitle}>{post.title}</Text>
          <Text style={styles.cardMeta}>{post.replies} private replies</Text>
        </ContentCard>
      ))}

      <FounderNote />
    </View>
  );
}

function HeroCard() {
  return (
    <View style={[styles.heroCard, shadow]}>
      <Text style={styles.heroEyebrow}>ENTER THE VAULT</Text>
      <Text style={styles.heroTitle}>Anonymous. Social. Private. Spiritual.</Text>
      <Text style={styles.heroBody}>
        SojournX gives every version of you a realm - a protected digital sanctuary for expression,
        connection, exchange, reflection, and growth.
      </Text>

      <View style={styles.heroPills}>
        <Pill label="Identity Control" />
        <Pill label="Private Realms" />
        <Pill label="Growth Engine" />
      </View>
    </View>
  );
}

function RealmsScreen({
  selectedRealm,
  setSelectedRealm
}: {
  selectedRealm: Realm;
  setSelectedRealm: (realm: Realm) => void;
}) {
  return (
    <View>
      <SectionTitle title="The SojournX Realms" subtitle="Each realm is a different mode of being." />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.realmSelector}>
        {realms.map((realm) => {
          const active = selectedRealm.key === realm.key;

          return (
            <TouchableOpacity
              key={realm.key}
              onPress={() => setSelectedRealm(realm)}
              style={[styles.realmChip, active && styles.realmChipActive]}
            >
              <Text style={styles.realmIcon}>{realm.icon}</Text>
              <Text style={[styles.realmChipText, active && styles.realmChipTextActive]}>
                {realm.shortTitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.realmDetail, shadow]}>
        <Text style={styles.realmDetailIcon}>{selectedRealm.icon}</Text>
        <Text style={styles.realmDetailTitle}>{selectedRealm.title}</Text>
        <Text style={styles.realmPromise}>{selectedRealm.promise}</Text>
        <Text style={styles.bodyText}>{selectedRealm.description}</Text>

        <View style={styles.featureList}>
          {selectedRealm.features.map((feature) => (
            <View key={feature} style={styles.featureRow}>
              <Text style={styles.featureBullet}>◆</Text>
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>
      </View>

      <ContentCard>
        <Text style={styles.cardKicker}>CATEGORY</Text>
        <Text style={styles.cardTitle}>Multi-Realm Identity Platform</Text>
        <Text style={styles.bodyText}>
          SojournX is designed to create a new category: one app where users can be anonymous,
          social, private, commercial, spiritual, and evolving.
        </Text>
      </ContentCard>
    </View>
  );
}

function MessagesScreen() {
  return (
    <View>
      <SectionTitle title="Private Messaging Realm" subtitle="Your silent chamber inside the vault." />

      {privateMessages.map((message) => (
        <ContentCard key={message.name}>
          <View style={styles.messageRow}>
            <View>
              <Text style={styles.cardTitle}>{message.name}</Text>
              <Text style={styles.bodyText}>{message.preview}</Text>
            </View>

            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{message.unread}</Text>
            </View>
          </View>
        </ContentCard>
      ))}

      <ContentCard>
        <Text style={styles.cardKicker}>SECURITY ROADMAP</Text>
        <Text style={styles.cardTitle}>Private by design, verified before claim.</Text>
        <Text style={styles.bodyText}>
          This prototype represents the messaging experience. Production must include real encryption
          architecture and independent review before making public encryption claims.
        </Text>
      </ContentCard>
    </View>
  );
}

function MarketplaceScreen() {
  return (
    <View>
      <SectionTitle title="Marketplace Realm" subtitle="A private exchange, not a public performance." />

      {marketItems.map((item) => (
        <ContentCard key={item.title}>
          <View style={styles.marketRow}>
            <View>
              <Text style={styles.cardKicker}>{item.category}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.bodyText}>
                Private seller chat and secure checkout flow planned for production.
              </Text>
            </View>

            <Text style={styles.price}>{item.price}</Text>
          </View>
        </ContentCard>
      ))}

      <ContentCard>
        <Text style={styles.cardKicker}>TRUST LAYER</Text>
        <Text style={styles.cardTitle}>Anonymous or verified - user controlled.</Text>
        <Text style={styles.bodyText}>
          The marketplace should support anonymous listings, verified listings, seller reputation,
          dispute handling, payment compliance, and prohibited item rules.
        </Text>
      </ContentCard>
    </View>
  );
}

function GrowthScreen() {
  return (
    <View>
      <SectionTitle title="Spiritual + Self-Development Realm" subtitle="The app becomes a mirror." />

      <View style={[styles.reflectionCard, shadow]}>
        <Text style={styles.heroEyebrow}>DAILY REFLECTION</Text>
        <Text style={styles.heroTitle}>What part of you is ready to be seen?</Text>
        <Text style={styles.heroBody}>
          Take one minute to name the version of yourself that is emerging today.
        </Text>
      </View>

      <SectionTitle
        title="Evolution Signals"
        subtitle="A prototype view of the personal growth dashboard."
      />

      {growthSignals.map((signal) => (
        <ContentCard key={signal.label}>
          <Text style={styles.cardKicker}>{signal.label}</Text>
          <Text style={styles.cardTitle}>{signal.value}</Text>
          <Text style={styles.bodyText}>{signal.detail}</Text>
        </ContentCard>
      ))}

      <ContentCard>
        <Text style={styles.cardKicker}>WELLNESS DISCLAIMER</Text>
        <Text style={styles.bodyText}>
          Spiritual and self-development features should be presented as reflection tools, not
          medical, therapeutic, diagnostic, or emergency mental health services.
        </Text>
      </ContentCard>
    </View>
  );
}

function SmallRealmCard({ realm }: { realm: Realm }) {
  return (
    <View style={styles.smallRealmCard}>
      <Text style={styles.realmIcon}>{realm.icon}</Text>
      <Text style={styles.smallRealmTitle}>{realm.shortTitle}</Text>
      <Text style={styles.smallRealmText}>{realm.promise}</Text>
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

function ContentCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.contentCard}>{children}</View>;
}

function Pill({ label }: { label: string }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillText}>{label}</Text>
    </View>
  );
}

function FounderNote() {
  return (
    <ContentCard>
      <Text style={styles.cardKicker}>FOUNDER NOTE</Text>
      <Text style={styles.cardTitle}>Build the vault before scaling the crowd.</Text>
      <Text style={styles.bodyText}>
        The strongest MVP sequence is identity selector, anonymous realm, private messaging
        foundation, reflection engine, and moderation workflow. Prove the category before expanding
        every realm.
      </Text>
    </ContentCard>
  );
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
  realmGrid: {
    flexDirection: "row",
    gap: spacing.sm
  },
  smallRealmCard: {
    flex: 1,
    backgroundColor: colors.deepBlack,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderBlack
  },
  realmIcon: {
    color: colors.crimsonGlow,
    fontSize: 24,
    marginBottom: 8
  },
  smallRealmTitle: {
    color: colors.boneWhite,
    fontSize: 14,
    fontWeight: "900"
  },
  smallRealmText: {
    color: colors.mutedGray,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6
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
  realmSelector: {
    gap: spacing.sm,
    paddingBottom: spacing.md
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
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  unreadBadge: {
    backgroundColor: colors.sojournRed,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  unreadText: {
    color: colors.boneWhite,
    fontSize: 12,
    fontWeight: "900"
  },
  marketRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md
  },
  price: {
    color: colors.crimsonGlow,
    fontSize: 18,
    fontWeight: "900"
  },
  reflectionCard: {
    backgroundColor: colors.darkRed,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.crimsonGlow
  }
});