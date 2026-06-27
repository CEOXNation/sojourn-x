import React, { useMemo, useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  Cpu,
  MessageSquare,
  SlidersHorizontal,
  Activity,
  Radar,
  Fingerprint,
  KeyRound,
  ScanFace,
  Command,
  Gauge,
  Layers,
  Crown,
  Settings,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Send,
  TerminalSquare,
  Smartphone,
  Server,
  Wifi,
  Database,
  ChevronRight,
} from "lucide-react";

const themePresets = {
  crimson: {
    name: "Crimson Command",
    description: "Black tactical shell, crimson signal glow, white-hot clarity.",
    shell: "bg-[#050506]",
    panel: "bg-[#0d0d10]/90",
    panelSoft: "bg-[#15151a]/80",
    border: "border-red-500/25",
    text: "text-white",
    muted: "text-zinc-400",
    accent: "text-red-400",
    accentText: "text-red-100",
    glow: "shadow-[0_0_44px_rgba(239,68,68,0.20)]",
    button:
      "bg-red-600 hover:bg-red-500 text-white border border-red-400/40 shadow-[0_0_24px_rgba(239,68,68,0.30)]",
    badge: "bg-red-500/15 text-red-200 border border-red-400/30",
    danger: "text-red-300",
    success: "text-emerald-300",
    line: "from-red-500 via-white to-red-500",
  },
  obsidian: {
    name: "Obsidian Gold",
    description: "Luxury prestige mode with black glass and gold authority.",
    shell: "bg-[#050505]",
    panel: "bg-[#10100c]/90",
    panelSoft: "bg-[#181610]/80",
    border: "border-yellow-500/25",
    text: "text-white",
    muted: "text-stone-400",
    accent: "text-yellow-300",
    accentText: "text-yellow-100",
    glow: "shadow-[0_0_44px_rgba(234,179,8,0.16)]",
    button:
      "bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-200/40 shadow-[0_0_24px_rgba(234,179,8,0.25)]",
    badge: "bg-yellow-500/15 text-yellow-200 border border-yellow-400/30",
    danger: "text-red-300",
    success: "text-emerald-300",
    line: "from-yellow-500 via-white to-yellow-500",
  },
  arctic: {
    name: "Arctic Signal",
    description: "Crisp elite light mode with cool signal intelligence.",
    shell: "bg-slate-100",
    panel: "bg-white/90",
    panelSoft: "bg-slate-50/90",
    border: "border-sky-400/35",
    text: "text-slate-950",
    muted: "text-slate-500",
    accent: "text-sky-600",
    accentText: "text-sky-900",
    glow: "shadow-[0_0_38px_rgba(14,165,233,0.20)]",
    button:
      "bg-sky-600 hover:bg-sky-500 text-white border border-sky-300/60 shadow-[0_0_22px_rgba(14,165,233,0.25)]",
    badge: "bg-sky-500/15 text-sky-700 border border-sky-400/30",
    danger: "text-red-600",
    success: "text-emerald-600",
    line: "from-sky-500 via-slate-900 to-sky-500",
  },
  violet: {
    name: "Violet Neon",
    description: "Cinematic creator mode with violet glow and black glass.",
    shell: "bg-[#07050d]",
    panel: "bg-[#120d1d]/90",
    panelSoft: "bg-[#1b1230]/80",
    border: "border-violet-400/25",
    text: "text-white",
    muted: "text-violet-200/60",
    accent: "text-violet-300",
    accentText: "text-violet-100",
    glow: "shadow-[0_0_44px_rgba(139,92,246,0.22)]",
    button:
      "bg-violet-600 hover:bg-violet-500 text-white border border-violet-300/40 shadow-[0_0_24px_rgba(139,92,246,0.30)]",
    badge: "bg-violet-500/15 text-violet-200 border border-violet-400/30",
    danger: "text-red-300",
    success: "text-emerald-300",
    line: "from-violet-500 via-white to-violet-500",
  },
};

const densityStyles = {
  compact: { page: "p-3", card: "p-4", text: "text-sm", gap: "gap-3", nav: "px-3 py-2 text-xs" },
  balanced: { page: "p-5", card: "p-5", text: "text-sm", gap: "gap-4", nav: "px-4 py-2 text-sm" },
  immersive: { page: "p-7", card: "p-7", text: "text-base", gap: "gap-5", nav: "px-5 py-3 text-sm" },
};

const cornerStyles = {
  sharp: "rounded-md",
  executive: "rounded-2xl",
  soft: "rounded-[2rem]",
};

const motionStyles = {
  minimal: "transition-none",
  balanced: "transition-all duration-300",
  cinematic: "transition-all duration-700 ease-out",
};

const tabs = [
  { id: "overview", label: "Overview", icon: <Command size={16} /> },
  { id: "signals", label: "Signals", icon: <Activity size={16} /> },
  { id: "ai", label: "Aegis AI", icon: <Sparkles size={16} /> },
  { id: "messages", label: "Secure Messages", icon: <MessageSquare size={16} /> },
  { id: "privacy", label: "Privacy", icon: <ShieldCheck size={16} /> },
  { id: "customize", label: "Customize", icon: <SlidersHorizontal size={16} /> },
];

const messages = [
  {
    id: 1,
    sender: "Executive Desk",
    label: "Private itinerary update",
    preview: "Protected itinerary details are available after verified identity confirmation.",
    priority: "elevated",
    encrypted: true,
    verifiedOnly: true,
  },
  {
    id: 2,
    sender: "Concierge Channel",
    label: "Preference profile ready",
    preview: "Your preference profile has been organized for the next curated experience.",
    priority: "standard",
    encrypted: true,
    verifiedOnly: true,
  },
  {
    id: 3,
    sender: "Security Layer",
    label: "Trusted session posture",
    preview: "Current device posture is stable. Re-lock is recommended before handoff.",
    priority: "critical",
    encrypted: true,
    verifiedOnly: false,
  },
];

const trustSignals = [
  { label: "Identity", value: 92 },
  { label: "Device", value: 84 },
  { label: "Session", value: 78 },
  { label: "Privacy", value: 96 },
  { label: "AI Guardrails", value: 88 },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function getGreeting(verified, personality) {
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const verifiedLine = verified
    ? "Identity verified. Protected systems are standing by."
    : "Please verify identity before opening protected intel.";

  const personalityLine = {
    aegis: `${dayPart}. ${verifiedLine}`,
    concierge: `${dayPart}. Your private concierge layer is online. ${verifiedLine}`,
    analyst: `${dayPart}. Signal analysis is active. ${verifiedLine}`,
    sentinel: `${dayPart}. Sentinel watch is active. ${verifiedLine}`,
  };

  return personalityLine[personality];
}

function maskText(text, verified) {
  if (verified) return text;
  return "•••••••• •••••••• •••••••• •••••••• ••••••••";
}

function Meter({ label, value, theme, verified }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className={cx("font-medium", theme.text)}>{label}</span>
        <span className={cx("tabular-nums", verified ? theme.accent : theme.muted)}>
          {verified ? `${value}%` : "Masked"}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/30 border border-white/10">
        <div
          className={cx("h-full rounded-full bg-gradient-to-r", theme.line, verified ? "opacity-100" : "opacity-30")}
          style={{ width: verified ? `${value}%` : "38%" }}
        />
      </div>
    </div>
  );
}

function Pill({ children, theme, active = false, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center gap-2 border backdrop-blur-md",
        "px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em]",
        active ? theme.button : cx(theme.badge, "hover:bg-white/10"),
        "transition-all"
      )}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, eyebrow, icon, children, theme, density, corner, motion, className }) {
  const d = densityStyles[density];

  return (
    <section
      className={cx(
        theme.panel,
        theme.border,
        theme.glow,
        d.card,
        cornerStyles[corner],
        motionStyles[motion],
        "border backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          {eyebrow && <p className={cx("text-xs uppercase tracking-[0.22em] mb-2", theme.accent)}>{eyebrow}</p>}
          <h2 className={cx("text-xl font-bold tracking-tight", theme.text)}>{title}</h2>
        </div>
        {icon && (
          <div className={cx("h-10 w-10 flex items-center justify-center border", theme.badge, cornerStyles[corner])}>
            {icon}
          </div>
        )}
      </div>
      {children}
    </section>
  );
}

function CommandButton({ children, theme, onClick, variant = "primary" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em]",
        "border rounded-xl",
        variant === "primary" ? theme.button : cx("bg-white/5 hover:bg-white/10", theme.border, theme.text)
      )}
    >
      {children}
    </button>
  );
}

function ControlGroup({ title, options, value, setValue, theme }) {
  return (
    <div className="mb-6">
      <p className={cx("mb-3 text-xs uppercase tracking-[0.2em]", theme.muted)}>{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            type="button"
            key={option}
            onClick={() => setValue(option)}
            className={cx(
              "px-3 py-2 rounded-xl border text-xs font-bold uppercase tracking-[0.16em]",
              value === option ? theme.button : cx(theme.badge, "hover:bg-white/10")
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");
  const [themePreset, setThemePreset] = useState("crimson");
  const [density, setDensity] = useState("balanced");
  const [corner, setCorner] = useState("executive");
  const [motion, setMotion] = useState("balanced");
  const [assistantPersonality, setAssistantPersonality] = useState("aegis");

  const [identityVerified, setIdentityVerified] = useState(false);
  const [trustedDevice, setTrustedDevice] = useState(true);
  const [sessionLocked, setSessionLocked] = useState(true);
  const [hideSensitivePreviews, setHideSensitivePreviews] = useState(true);
  const [secureMessaging, setSecureMessaging] = useState(true);

  const theme = themePresets[themePreset];
  const d = densityStyles[density];
  const verifiedAndUnlocked = identityVerified && !sessionLocked;

  const assistantGreeting = useMemo(
    () => getGreeting(verifiedAndUnlocked, assistantPersonality),
    [verifiedAndUnlocked, assistantPersonality]
  );

  const trustScore = useMemo(() => {
    const base =
      (identityVerified ? 35 : 8) +
      (trustedDevice ? 25 : 4) +
      (!sessionLocked ? 20 : 5) +
      (hideSensitivePreviews ? 10 : 0) +
      (secureMessaging ? 10 : 0);
    return Math.min(base, 100);
  }, [identityVerified, trustedDevice, sessionLocked, hideSensitivePreviews, secureMessaging]);

  function verifyIdentity() {
    setIdentityVerified(true);
    setSessionLocked(false);
  }

  function relock() {
    setSessionLocked(true);
  }

  function resetSecurity() {
    setIdentityVerified(false);
    setSessionLocked(true);
    setTrustedDevice(false);
  }

  function renderOverview() {
    return (
      <div className={cx("grid lg:grid-cols-3", d.gap)}>
        <SectionCard
          title="Executive Command"
          eyebrow="Sojourn-X"
          icon={<Radar size={20} />}
          theme={theme}
          density={density}
          corner={corner}
          motion={motion}
          className="lg:col-span-2"
        >
          <div className="space-y-6">
            <div>
              <h1 className={cx("text-4xl md:text-6xl font-black leading-none", theme.text)}>Crimson Command</h1>
              <p className={cx("mt-4 max-w-2xl leading-7", theme.muted)}>
                A luxury tactical interface for private, verified, AI-assisted experiences. Content stays masked by default
                until identity and session posture are trusted.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div className={cx(theme.panelSoft, theme.border, "border p-4 rounded-2xl")}>
                <ShieldCheck className={theme.accent} />
                <p className={cx("mt-3 text-xs uppercase tracking-[0.2em]", theme.muted)}>Trust Score</p>
                <p className={cx("text-3xl font-black mt-1", theme.text)}>{trustScore}%</p>
              </div>
              <div className={cx(theme.panelSoft, theme.border, "border p-4 rounded-2xl")}>
                {verifiedAndUnlocked ? <Unlock className={theme.success} /> : <Lock className={theme.danger} />}
                <p className={cx("mt-3 text-xs uppercase tracking-[0.2em]", theme.muted)}>Session</p>
                <p className={cx("text-3xl font-black mt-1", theme.text)}>{verifiedAndUnlocked ? "Open" : "Locked"}</p>
              </div>
              <div className={cx(theme.panelSoft, theme.border, "border p-4 rounded-2xl")}>
                <Cpu className={theme.accent} />
                <p className={cx("mt-3 text-xs uppercase tracking-[0.2em]", theme.muted)}>AI Mode</p>
                <p className={cx("text-3xl font-black mt-1 capitalize", theme.text)}>{assistantPersonality}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <CommandButton theme={theme} onClick={verifyIdentity}>
                <Fingerprint size={16} /> Verify Identity
              </CommandButton>
              <CommandButton theme={theme} onClick={relock} variant="ghost">
                <Lock size={16} /> Re-Lock
              </CommandButton>
              <CommandButton theme={theme} onClick={() => setActiveTab("customize")} variant="ghost">
                <SlidersHorizontal size={16} /> Theme Forge
              </CommandButton>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Aegis Greeting"
          eyebrow="AI Concierge"
          icon={<Sparkles size={20} />}
          theme={theme}
          density={density}
          corner={corner}
          motion={motion}
        >
          <div className="space-y-5">
            <div className={cx(theme.panelSoft, theme.border, "border p-4 rounded-2xl")}>
              <p className={cx("text-lg font-semibold leading-8", theme.text)}>“{assistantGreeting}”</p>
            </div>
            <div className="space-y-3">
              {["aegis", "concierge", "analyst", "sentinel"].map((mode) => (
                <Pill key={mode} theme={theme} active={assistantPersonality === mode} onClick={() => setAssistantPersonality(mode)}>
                  {mode}
                </Pill>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Protected Intelligence"
          eyebrow="Verification-aware"
          icon={<EyeOff size={20} />}
          theme={theme}
          density={density}
          corner={corner}
          motion={motion}
          className="lg:col-span-3"
        >
          <div className="grid md:grid-cols-4 gap-4">
            {[
              ["Private itinerary", "Available after verified session unlock."],
              ["Concierge memory", "User preferences are separated from viewing surfaces."],
              ["Secure contact layer", "Messaging previews stay hidden by default."],
              ["Export vault", "Exports require explicit verified action."],
            ].map(([title, copy]) => (
              <div key={title} className={cx(theme.panelSoft, theme.border, "border p-5 rounded-2xl")}>
                <p className={cx("font-bold", theme.text)}>{title}</p>
                <p className={cx("mt-3 leading-6", theme.muted)}>
                  {maskText(copy, verifiedAndUnlocked || !hideSensitivePreviews)}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderSignals() {
    return (
      <div className={cx("grid lg:grid-cols-2", d.gap)}>
        <SectionCard title="Signal Performance" eyebrow="Trust / AI / UX" icon={<Gauge size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <div className="space-y-5">
            {trustSignals.map((signal) => (
              <Meter key={signal.label} label={signal.label} value={signal.value} theme={theme} verified={verifiedAndUnlocked} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Operational Readiness" eyebrow="Command telemetry" icon={<Activity size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <div className="grid grid-cols-2 gap-4">
            {[
              ["AI Concierge", "Online", Cpu],
              ["Secure Messaging", secureMessaging ? "Hardened" : "Standard", MessageSquare],
              ["Device Posture", trustedDevice ? "Trusted" : "Untrusted", Smartphone],
              ["Session State", verifiedAndUnlocked ? "Verified" : "Locked", Lock],
              ["Privacy Masking", hideSensitivePreviews ? "Enabled" : "Reduced", EyeOff],
              ["Data Surface", "Separated", Database],
            ].map(([label, value, Icon]) => (
              <div key={label} className={cx(theme.panelSoft, theme.border, "border p-5 rounded-2xl")}>
                <Icon className={theme.accent} size={20} />
                <p className={cx("mt-4 text-xs uppercase tracking-[0.2em]", theme.muted)}>{label}</p>
                <p className={cx("mt-1 text-xl font-black", theme.text)}>{value}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderAI() {
    const quickActions = [
      "Summarize protected briefing",
      "Switch to Obsidian Gold",
      "Lock session",
      "Explain privacy posture",
      "Open secure messages",
      "Reduce motion",
    ];

    function handleQuickAction(action) {
      if (action === "Switch to Obsidian Gold") setThemePreset("obsidian");
      if (action === "Lock session") relock();
      if (action === "Open secure messages") setActiveTab("messages");
      if (action === "Reduce motion") setMotion("minimal");
    }

    return (
      <div className={cx("grid lg:grid-cols-3", d.gap)}>
        <SectionCard title="Aegis AI Concierge" eyebrow="Private intelligence dock" icon={<Sparkles size={20} />} theme={theme} density={density} corner={corner} motion={motion} className="lg:col-span-2">
          <div className="space-y-5">
            <div className={cx(theme.panelSoft, theme.border, "border p-5 rounded-2xl")}>
              <p className={cx("text-xl font-semibold leading-9", theme.text)}>“{assistantGreeting}”</p>
              <p className={cx("mt-3 leading-7", theme.muted)}>
                Current assistant mode is <span className={cx("font-bold capitalize", theme.accent)}>{assistantPersonality}</span>. Suggestions adapt to identity verification, masking posture, and trusted session state.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <button
                  type="button"
                  key={action}
                  onClick={() => handleQuickAction(action)}
                  className={cx(theme.panelSoft, theme.border, "border p-4 rounded-2xl text-left hover:scale-[1.01]", motionStyles[motion])}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className={cx("font-semibold", theme.text)}>{action}</span>
                    <ChevronRight className={theme.accent} size={18} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Personality Matrix" eyebrow="Assistant control" icon={<TerminalSquare size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <div className="space-y-3">
            {["aegis", "concierge", "analyst", "sentinel"].map((mode) => (
              <button
                type="button"
                key={mode}
                onClick={() => setAssistantPersonality(mode)}
                className={cx(
                  "w-full flex items-center justify-between border p-4 rounded-2xl capitalize",
                  assistantPersonality === mode ? theme.button : cx(theme.panelSoft, theme.border, theme.text)
                )}
              >
                <span className="font-bold">{mode}</span>
                {assistantPersonality === mode && <CheckCircle2 size={18} />}
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderMessages() {
    return (
      <SectionCard title="Secure Messages" eyebrow="Verification-aware inbox" icon={<MessageSquare size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
        <div className="space-y-4">
          {messages.map((message) => {
            const locked = message.verifiedOnly && !verifiedAndUnlocked;
            return (
              <div key={message.id} className={cx(theme.panelSoft, theme.border, "border p-5 rounded-2xl")}>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={cx("font-black", theme.text)}>{message.sender}</p>
                      {message.encrypted && <span className={cx("text-xs px-2 py-1 rounded-full", theme.badge)}>Encrypted</span>}
                      <span className={cx("text-xs px-2 py-1 rounded-full capitalize", theme.badge)}>{message.priority}</span>
                    </div>
                    <p className={cx("mt-2 font-semibold", theme.accentText)}>{locked ? "Protected message locked" : message.label}</p>
                    <p className={cx("mt-3 leading-7", theme.muted)}>
                      {locked || hideSensitivePreviews ? maskText(message.preview, verifiedAndUnlocked && !hideSensitivePreviews) : message.preview}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {locked ? (
                      <CommandButton theme={theme} onClick={verifyIdentity}>
                        <Fingerprint size={16} /> Verify
                      </CommandButton>
                    ) : (
                      <CommandButton theme={theme} variant="ghost">
                        <Eye size={16} /> View
                      </CommandButton>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex flex-col md:flex-row gap-3">
            <input
              placeholder={verifiedAndUnlocked ? "Compose secure message..." : "Verify identity to compose secure message..."}
              disabled={!verifiedAndUnlocked}
              className={cx("flex-1 rounded-2xl border bg-black/20 px-4 py-3 outline-none", theme.border, theme.text, "placeholder:text-zinc-500 disabled:opacity-40")}
            />
            <CommandButton theme={theme} variant={verifiedAndUnlocked ? "primary" : "ghost"}>
              <Send size={16} /> Send Secure
            </CommandButton>
          </div>
        </div>
      </SectionCard>
    );
  }

  function renderPrivacy() {
    return (
      <div className={cx("grid lg:grid-cols-3", d.gap)}>
        <SectionCard title="Privacy Command" eyebrow="Identity-first model" icon={<ShieldCheck size={20} />} theme={theme} density={density} corner={corner} motion={motion} className="lg:col-span-2">
          <div className="space-y-4">
            {[
              { icon: Fingerprint, title: "Identity Gate", copy: "Protected surfaces require explicit identity verification before access.", active: identityVerified },
              { icon: ScanFace, title: "Biometric-style UX", copy: "The interface models face or biometric verification flows for premium trust signaling.", active: identityVerified },
              { icon: KeyRound, title: "Passkey Challenge", copy: "Passkey-style challenge flow is represented as the preferred unlock pattern.", active: identityVerified },
              { icon: Smartphone, title: "Trusted Device", copy: "Device posture is surfaced clearly before sensitive panels open.", active: trustedDevice },
              { icon: EyeOff, title: "Masked by Default", copy: "Sensitive previews are hidden unless the user explicitly reduces masking.", active: hideSensitivePreviews },
              { icon: Lock, title: "Re-Lock Control", copy: "The session can be manually locked at any moment.", active: sessionLocked },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={cx(theme.panelSoft, theme.border, "border p-5 rounded-2xl")}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <Icon className={theme.accent} size={22} />
                      <div>
                        <p className={cx("font-black", theme.text)}>{item.title}</p>
                        <p className={cx("mt-2 leading-6", theme.muted)}>{item.copy}</p>
                      </div>
                    </div>
                    {item.active ? <CheckCircle2 className={theme.success} size={20} /> : <AlertTriangle className={theme.danger} size={20} />}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Session Controls" eyebrow="Trust posture" icon={<Lock size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <div className="space-y-3">
            <CommandButton theme={theme} onClick={verifyIdentity}><Fingerprint size={16} /> Verify / Unlock</CommandButton>
            <CommandButton theme={theme} onClick={relock} variant="ghost"><Lock size={16} /> Re-Lock Session</CommandButton>
            <CommandButton theme={theme} onClick={() => setTrustedDevice(!trustedDevice)} variant="ghost"><Smartphone size={16} /> Toggle Device Trust</CommandButton>
            <CommandButton theme={theme} onClick={() => setHideSensitivePreviews(!hideSensitivePreviews)} variant="ghost">
              {hideSensitivePreviews ? <EyeOff size={16} /> : <Eye size={16} />} Toggle Masking
            </CommandButton>
            <CommandButton theme={theme} onClick={() => setSecureMessaging(!secureMessaging)} variant="ghost"><MessageSquare size={16} /> Secure Messaging</CommandButton>
            <CommandButton theme={theme} onClick={resetSecurity} variant="ghost"><RotateCcw size={16} /> Reset Posture</CommandButton>
          </div>
        </SectionCard>
      </div>
    );
  }

  function renderCustomize() {
    return (
      <div className={cx("grid lg:grid-cols-2", d.gap)}>
        <SectionCard title="Theme Forge" eyebrow="Runtime visual system" icon={<Layers size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <div className="grid gap-3">
            {Object.entries(themePresets).map(([key, preset]) => (
              <button
                type="button"
                key={key}
                onClick={() => setThemePreset(key)}
                className={cx("text-left border p-5 rounded-2xl", themePreset === key ? theme.button : cx(theme.panelSoft, theme.border))}
              >
                <p className="font-black">{preset.name}</p>
                <p className={cx("mt-2 leading-6", themePreset === key ? "opacity-90" : theme.muted)}>{preset.description}</p>
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Customization Lab" eyebrow="Live control surface" icon={<Settings size={20} />} theme={theme} density={density} corner={corner} motion={motion}>
          <ControlGroup title="Density" options={["compact", "balanced", "immersive"]} value={density} setValue={setDensity} theme={theme} />
          <ControlGroup title="Corner Style" options={["sharp", "executive", "soft"]} value={corner} setValue={setCorner} theme={theme} />
          <ControlGroup title="Motion" options={["minimal", "balanced", "cinematic"]} value={motion} setValue={setMotion} theme={theme} />
          <ControlGroup title="Assistant Personality" options={["aegis", "concierge", "analyst", "sentinel"]} value={assistantPersonality} setValue={setAssistantPersonality} theme={theme} />
        </SectionCard>
      </div>
    );
  }

  return (
    <main className={cx("min-h-screen overflow-hidden", theme.shell, theme.text, d.page, motionStyles[motion])}>
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <header className={cx(theme.panel, theme.border, theme.glow, "border backdrop-blur-xl mb-5", d.card, cornerStyles[corner])}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className={cx("h-11 w-11 flex items-center justify-center border", theme.badge, cornerStyles[corner])}>
                <Crown size={22} />
              </div>
              <div>
                <p className={cx("text-xs uppercase tracking-[0.26em]", theme.accent)}>Founder / Operator Prestige Panel</p>
                <h1 className={cx("text-2xl md:text-3xl font-black", theme.text)}>Sojourn-X</h1>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className={cx("inline-flex items-center gap-2 px-3 py-2 rounded-xl", theme.badge)}>
                {verifiedAndUnlocked ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                {verifiedAndUnlocked ? "Verified Session" : "Protected Lock"}
              </span>
              <span className={cx("inline-flex items-center gap-2 px-3 py-2 rounded-xl", theme.badge)}>
                <Wifi size={16} /> {trustedDevice ? "Trusted Device" : "Untrusted Device"}
              </span>
              <span className={cx("inline-flex items-center gap-2 px-3 py-2 rounded-xl", theme.badge)}>
                <Server size={16} /> Privacy First
              </span>
            </div>
          </div>
        </header>

        <nav className={cx(theme.panel, theme.border, "border backdrop-blur-xl mb-5 overflow-x-auto", d.card, cornerStyles[corner])}>
          <div className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cx(
                  "inline-flex items-center gap-2 font-bold uppercase tracking-[0.16em] border",
                  d.nav,
                  cornerStyles[corner],
                  activeTab === tab.id ? theme.button : cx(theme.badge, "hover:bg-white/10")
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div className={cx(d.text)}>
          {activeTab === "overview" && renderOverview()}
          {activeTab === "signals" && renderSignals()}
          {activeTab === "ai" && renderAI()}
          {activeTab === "messages" && renderMessages()}
          {activeTab === "privacy" && renderPrivacy()}
          {activeTab === "customize" && renderCustomize()}
        </div>

        <footer className={cx("mt-5 border backdrop-blur-xl", theme.panel, theme.border, d.card, cornerStyles[corner])}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className={cx("leading-6", theme.muted)}>
              Sojourn-X Crimson Command prototype. Security claims are represented as UX posture only; production requires real authentication, encryption, secure backend services, audit logging, and OS-native identity APIs.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className={cx("px-3 py-2 rounded-xl", theme.badge)}>Theme: {theme.name}</span>
              <span className={cx("px-3 py-2 rounded-xl capitalize", theme.badge)}>{density}</span>
              <span className={cx("px-3 py-2 rounded-xl capitalize", theme.badge)}>{motion}</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
