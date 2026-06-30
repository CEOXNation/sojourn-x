import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ContactSyncState, SyncedContact } from "./types";

const CONTACTS_KEY = "sojournx.beta.contacts";
const CONTACTS_STATE_KEY = "sojournx.beta.contacts.state";

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