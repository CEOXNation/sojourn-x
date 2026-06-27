import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const APP_NAME = 'SOJOURN-x Vault';
const STORAGE_KEY = 'sojourn_x_v4_linux_vault';
const PASSCODE_KEY = 'sojourn_x_v4_passcode';
const SESSION_UNLOCK_KEY = 'sojourn_x_v4_session_unlocked';
const initialEntry = {
  title: '',
  body: '',
  mood: 'Focused',
};

const moods = [
  { name: 'Calm', tone: 'bg-blue-950/60 text-blue-200 border-blue-800 shadow-blue-950/40' },
  { name: 'Focused', tone: 'bg-indigo-950/60 text-indigo-200 border-indigo-800 shadow-indigo-950/40' },
  { name: 'Heavy', tone: 'bg-zinc-800 text-zinc-200 border-zinc-700 shadow-zinc-950/40' },
  { name: 'Hopeful', tone: 'bg-yellow-950/60 text-yellow-200 border-yellow-800 shadow-yellow-950/40' },
  { name: 'Restless', tone: 'bg-orange-950/60 text-orange-200 border-orange-800 shadow-orange-950/40' },
  { name: 'Grateful', tone: 'bg-rose-950/60 text-rose-200 border-rose-800 shadow-rose-950/40' },
  { name: 'Unclear', tone: 'bg-cyan-950/60 text-cyan-200 border-cyan-800 shadow-cyan-950/40' },
  { name: 'Grounded', tone: 'bg-emerald-950/60 text-emerald-200 border-emerald-800 shadow-emerald-950/40' },
];

function readVault() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredPasscode() {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(PASSCODE_KEY) || '';
}


function isSessionUnlocked() {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(SESSION_UNLOCK_KEY) === 'true';
}


export default function App() {
  const [entry, setEntry] = useState(initialEntry);
  const [vault, setVault] = useState([]);
  const [query, setQuery] = useState('');
  const [savedPulse, setSavedPulse] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const [storedPasscode, setStoredPasscode] = useState('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [lockMessage, setLockMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);


  useEffect(() => {
    setVault(readVault());

    const savedPasscode = getStoredPasscode();
    setStoredPasscode(savedPasscode);
    setIsUnlocked(!savedPasscode || isSessionUnlocked());


    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };


    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vault));
  }, [vault]);

  const filteredVault = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return vault;


    return vault.filter((item) =>
      [item.title, item.body, item.mood].some((value) =>
        String(value).toLowerCase().includes(normalized)
      )
    );
  }, [vault, query]);

  const activeMood = moods.find((item) => item.name === entry.mood) || moods[1];
  const totalWords = vault.reduce((sum, item) => sum + item.body.split(/\s+/).filter(Boolean).length, 0);


  function saveEntry() {
    if (!entry.body.trim()) return;

    const record = {
      id: crypto.randomUUID(),
      title: entry.title.trim() || buildSmartTitle(entry.mood),
      body: entry.body.trim(),
      mood: entry.mood,
      createdAt: new Date().toLocaleString(),
    };

    setVault((current) => [record, ...current]);
    setEntry(initialEntry);
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 900);
  }

  function buildSmartTitle(mood) {
    const hour = new Date().getHours();
    const timeName = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
    return `${timeName} ${mood} Reflection`;
  }


  function deleteEntry(id) {
    setVault((current) => current.filter((item) => item.id !== id));
  }

  function exportVault() {
    const blob = new Blob([JSON.stringify(vault, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sojourn-x-vault.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function importVault(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || '[]'));
        if (Array.isArray(parsed)) setVault(parsed);
      } catch {
        alert('Import failed. Choose a valid vault file.');
      }
    };

    reader.readAsText(file);
    event.target.value = '';
  }

  function clearVault() {
    if (confirm('Clear entire vault?')) setVault([]);
  }

  async function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function unlockVault() {
    if (!storedPasscode) {
      if (passcodeInput.length < 4) {
        setLockMessage('Choose at least 4 digits.');
        return;
      }
      if (passcodeInput !== confirmPasscodeInput) {
        setLockMessage('Passcodes do not match.');
        return;
      }
      window.localStorage.setItem(PASSCODE_KEY, passcodeInput);
      window.sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
      setStoredPasscode(passcodeInput);
      setIsUnlocked(true);
      setPasscodeInput('');
      setConfirmPasscodeInput('');
      setLockMessage('');
      return;
    }
    if (passcodeInput === storedPasscode) {
      window.sessionStorage.setItem(SESSION_UNLOCK_KEY, 'true');
      setIsUnlocked(true);
      setPasscodeInput('');
      setLockMessage('');
    } else {
      setLockMessage('Incorrect passcode. Try again.');
      setPasscodeInput('');
    }
  }


  function lockVault() {
    window.sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    setIsUnlocked(false);
    setShowSettings(false);
  }


  function changePasscode() {
    if (passcodeInput.length < 4) {
      setLockMessage('New passcode must be at least 4 digits.');
      return;
    }
    if (passcodeInput !== confirmPasscodeInput) {
      setLockMessage('New passcodes do not match.');
      return;
    }
    window.localStorage.setItem(PASSCODE_KEY, passcodeInput);
    setStoredPasscode(passcodeInput);
    setPasscodeInput('');
    setConfirmPasscodeInput('');
    setLockMessage('Passcode updated.');
  }


  function removePasscode() {
    if (!confirm('Remove passcode protection?')) return;
    window.localStorage.removeItem(PASSCODE_KEY);
    window.sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    setStoredPasscode('');
    setIsUnlocked(true);
    setPasscodeInput('');
    setConfirmPasscodeInput('');
    setLockMessage('Passcode removed.');
  }


  if (!isUnlocked) {
    return (
      <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#4a0b0b_0%,#09090b_45%,#000_100%)] px-4 py-8 text-zinc-100">
        <div className="pointer-events-none fixed inset-0 opacity-40">
          <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-red-700/30 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-56 w-56 rounded-full bg-zinc-700/20 blur-3xl" />
        </div>


        <div className="relative mx-auto flex min-h-[85vh] max-w-xl items-center justify-center">
          <motion.section
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full rounded-[2rem] border border-red-900/50 bg-black/70 p-8 shadow-[0_0_70px_rgba(127,29,29,0.25)] backdrop-blur-xl"
          >
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-red-800/70 bg-red-950/30 shadow-[0_0_40px_rgba(185,28,28,0.25)]">
                <span className="text-4xl font-black text-red-400">X</span>
              </div>
              <p className="text-xs uppercase tracking-[0.45em] text-red-500">Private Access</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white">SOJOURN-x</h1>
              <p className="mt-3 text-sm text-zinc-400">
                {storedPasscode ? 'Enter your vault passcode.' : 'Create a private passcode to protect your vault.'}
              </p>
            </div>


            <div className="space-y-3">
              <input
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                onKeyDown={(e) => e.key === 'Enter' && unlockVault()}
                inputMode="numeric"
                type="password"
                placeholder={storedPasscode ? 'Passcode' : 'Create passcode'}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 text-center text-2xl tracking-[0.35em] text-white outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-950/40"
              />


              {!storedPasscode && (
                <input
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  onKeyDown={(e) => e.key === 'Enter' && unlockVault()}
                  inputMode="numeric"
                  type="password"
                  placeholder="Confirm passcode"
                  className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-5 py-4 text-center text-2xl tracking-[0.35em] text-white outline-none transition focus:border-red-700 focus:ring-4 focus:ring-red-950/40"
                />
              )}


              {lockMessage && <p className="text-center text-sm text-red-300">{lockMessage}</p>}


              <button
                onClick={unlockVault}
                className="w-full rounded-2xl bg-gradient-to-r from-red-800 via-red-700 to-red-900 px-5 py-4 font-bold text-white shadow-[0_0_35px_rgba(185,28,28,0.28)] transition hover:scale-[1.01] hover:from-red-700 hover:to-red-800"
              >
                {storedPasscode ? 'Unlock Vault' : 'Create Vault Lock'}
              </button>
            </div>


            <p className="mt-6 text-center text-xs leading-relaxed text-zinc-500">
              Your passcode and entries stay on this device using local browser storage.
            </p>
          </motion.section>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#3f0707_0%,#0a0a0b_40%,#000_100%)] px-4 py-8 text-zinc-100 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 opacity-50">
        <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-red-800/20 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-80 w-80 rounded-full bg-zinc-700/10 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-6xl space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[2rem] border border-red-950/70 bg-zinc-950/80 p-8 shadow-[0_0_80px_rgba(127,29,29,0.23)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-red-500">Majestic Vault Mode</p>
              <h1 className="mt-3 text-5xl font-black tracking-tight text-white sm:text-6xl">SOJOURN-x</h1>
              <p className="mt-3 max-w-2xl text-zinc-400">Private reflection vault. Locked. Offline. Yours.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {deferredPrompt && (
                <button onClick={installApp} className="rounded-2xl bg-red-700 px-5 py-3 font-semibold text-white shadow-lg shadow-red-950/40 transition hover:bg-red-800">
                  Install App
                </button>
              )}
              <button onClick={() => setShowSettings((v) => !v)} className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/20">
                Settings
              </button>
              <button onClick={lockVault} className="rounded-2xl border border-red-900/70 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-950/30">
                Lock
              </button>
            </div>
          </div>
        </motion.section>

        <AnimatePresence>
          {showSettings && (
            <motion.section
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-[2rem] border border-zinc-800 bg-black/60 p-6 backdrop-blur-xl"
            >
              <h2 className="text-xl font-bold text-white">Vault Security</h2>
              <p className="mt-1 text-sm text-zinc-400">Update or remove your device passcode.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  inputMode="numeric"
                  type="password"
                  placeholder="New passcode"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
                <input
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  inputMode="numeric"
                  type="password"
                  placeholder="Confirm new passcode"
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-red-700"
                />
              </div>
              {lockMessage && <p className="mt-3 text-sm text-red-300">{lockMessage}</p>}
              <div className="mt-4 flex flex-wrap gap-3">
                <button onClick={changePasscode} className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800">Update Passcode</button>
                <button onClick={removePasscode} className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-300 hover:bg-zinc-900">Remove Passcode</button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>


        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.07 }}
            className="rounded-[2rem] border border-red-950/40 bg-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-red-500">New Reflection</p>
                <h2 className="mt-1 text-2xl font-bold text-white">Capture the moment</h2>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold shadow-lg ${activeMood.tone}`}>{activeMood.name}</span>
            </div>


            <input
              value={entry.title}
              onChange={(e) => setEntry((c) => ({ ...c, title: e.target.value }))}
              className="mb-3 w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-700 focus:ring-4 focus:ring-red-950/30"
              placeholder="Title optional — or let SOJOURN-x name it"
            />


            <textarea
              value={entry.body}
              onChange={(e) => setEntry((c) => ({ ...c, body: e.target.value }))}
              className="min-h-[190px] w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-700 focus:ring-4 focus:ring-red-950/30"
              placeholder="Write something worth keeping..."
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m.name}
                  onClick={() => setEntry((c) => ({ ...c, mood: m.name }))}
                  className={`rounded-xl border px-3 py-2 text-sm font-medium shadow-lg transition hover:scale-[1.03] ${m.name === entry.mood ? m.tone : 'border-zinc-800 bg-zinc-950/50 text-zinc-400 hover:border-red-900 hover:text-white'}`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={saveEntry} className={`rounded-2xl px-5 py-3 font-bold text-white shadow-lg transition hover:scale-[1.01] ${savedPulse ? 'bg-red-500 shadow-red-500/30' : 'bg-gradient-to-r from-red-800 via-red-700 to-red-900 shadow-red-950/50 hover:from-red-700 hover:to-red-800'}`}>
                {savedPulse ? 'Saved' : 'Save to Vault'}
              </button>
              <button onClick={exportVault} className="rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/20">Export</button>
              <label className="cursor-pointer rounded-2xl border border-zinc-700 px-5 py-3 font-semibold text-zinc-200 transition hover:border-red-800 hover:bg-red-950/20">
                Import
                <input type="file" accept=".json" onChange={importVault} hidden />
              </label>
              <button onClick={clearVault} className="rounded-2xl border border-red-900/70 px-5 py-3 font-semibold text-red-300 transition hover:bg-red-950/30">Clear</button>
            </div>
          </motion.section>
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="rounded-[2rem] border border-red-950/40 bg-black/60 p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div className="mb-5 grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
                <div className="text-2xl font-black text-white">{vault.length}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Entries</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
                <div className="text-2xl font-black text-white">{totalWords}</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Words</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 text-center">
                <div className="text-2xl font-black text-red-400">X</div>
                <div className="text-xs uppercase tracking-widest text-zinc-500">Locked</div>
              </div>
            </div>

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search vault..."
              className="mb-4 w-full rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-red-700 focus:ring-4 focus:ring-red-950/30"
            />

            <div className="max-h-[520px] space-y-3 overflow-auto pr-1">
              <AnimatePresence>
                {filteredVault.map((item) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-red-900/70 hover:bg-zinc-950"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-white">{item.title}</h3>
                        <p className="mt-1 text-xs text-zinc-500">{item.createdAt}</p>
                      </div>
                      <button onClick={() => deleteEntry(item.id)} className="text-sm font-medium text-red-500 transition hover:text-red-300">Delete</button>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-zinc-300">{item.body}</p>
                    <div className="mt-3 inline-flex rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-400">{item.mood}</div>
                  </motion.article>
                ))}
              </AnimatePresence>
              {filteredVault.length === 0 && (                <div className="rounded-2xl border border-dashed border-zinc-800 py-14 text-center text-zinc-500">                  No entries yet                </div>              )}            </div>          </motion.section>        </div>      </div>
    </div>
  );
}
