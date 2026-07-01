import AsyncStorage from "@react-native-async-storage/async-storage";

import type {
  BirthData,
  ContactSyncState,
  RealmPersonalization,
  RealmReminders,
  SpiritualQuestionnaire,
  SyncedContact
} from "./types";

const CONTACTS_KEY               = "sojournx.beta.contacts";
const CONTACTS_STATE_KEY         = "sojournx.beta.contacts.state";
export const BIRTH_DATA_KEY      = "sojournx.beta.birth";
export const SPIRITUAL_Q_KEY     = "sojournx.beta.spiritual.questionnaire";
export const PERSONALIZATION_KEY = "sojournx.beta.personalization";
export const REMINDERS_KEY       = "sojournx.beta.reminders";

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      return fallback;
    }

    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    return;
  }
}

export async function clearKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    return;
  }
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function loadSyncedContacts(): Promise<SyncedContact[]> {
  return loadJson<SyncedContact[]>(CONTACTS_KEY, []);
}

export async function saveSyncedContacts(contacts: SyncedContact[]): Promise<void> {
  await saveJson(CONTACTS_KEY, contacts);
}

export async function loadContactSyncState(fallback: ContactSyncState): Promise<ContactSyncState> {
  return loadJson<ContactSyncState>(CONTACTS_STATE_KEY, fallback);
}

export async function saveContactSyncState(state: ContactSyncState): Promise<void> {
  await saveJson(CONTACTS_STATE_KEY, state);
}

export async function clearContactSyncCache(): Promise<void> {
  await clearKeys([CONTACTS_KEY, CONTACTS_STATE_KEY]);
}

// ─── Birth & Spiritual ─────────────────────────────────────────────────────

export async function loadBirthData(): Promise<BirthData | null> {
  return loadJson<BirthData | null>(BIRTH_DATA_KEY, null);
}

export async function saveBirthData(data: BirthData): Promise<void> {
  await saveJson(BIRTH_DATA_KEY, data);
}

export async function loadSpiritualQuestionnaire(): Promise<SpiritualQuestionnaire | null> {
  return loadJson<SpiritualQuestionnaire | null>(SPIRITUAL_Q_KEY, null);
}

export async function saveSpiritualQuestionnaire(q: SpiritualQuestionnaire): Promise<void> {
  await saveJson(SPIRITUAL_Q_KEY, q);
}

// ─── Personalization ───────────────────────────────────────────────────────

export async function loadPersonalization(fallback: RealmPersonalization): Promise<RealmPersonalization> {
  return loadJson<RealmPersonalization>(PERSONALIZATION_KEY, fallback);
}

export async function savePersonalization(p: RealmPersonalization): Promise<void> {
  await saveJson(PERSONALIZATION_KEY, p);
}

// ─── Reminders ─────────────────────────────────────────────────────────────

export async function loadReminders(fallback: RealmReminders): Promise<RealmReminders> {
  return loadJson<RealmReminders>(REMINDERS_KEY, fallback);
}

export async function saveReminders(r: RealmReminders): Promise<void> {
  await saveJson(REMINDERS_KEY, r);
}