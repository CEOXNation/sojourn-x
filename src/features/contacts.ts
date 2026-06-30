import { Platform } from "react-native";

import type { ContactSyncPermission, ContactSyncResult, ContactSyncState, SyncedContact } from "../types";

const MAX_SYNCED_CONTACTS = 12;

const previewContacts: SyncedContact[] = [
  {
    id: "preview-1",
    displayName: "Nyx Veil",
    initials: "NV",
    phoneNumber: "+1 000 000 0101",
    trustNote: "Trusted circle · ready for quiet relay",
    matchState: "on-sojourn",
    realmAffinity: "anonymous",
    lastSeen: "2m ago",
    source: "preview"
  },
  {
    id: "preview-2",
    displayName: "Echo Vale",
    initials: "EV",
    phoneNumber: "+1 000 000 0102",
    trustNote: "Invite staged · masked introduction",
    matchState: "invite-ready",
    realmAffinity: "messaging",
    lastSeen: "12m ago",
    source: "preview"
  },
  {
    id: "preview-3",
    displayName: "Sable Rune",
    initials: "SR",
    phoneNumber: "+1 000 000 0103",
    trustNote: "Private relay only · no public graph",
    matchState: "private-relay",
    realmAffinity: "anonymous",
    lastSeen: "1h ago",
    source: "preview"
  }
];

function createState(partial: Partial<ContactSyncState>): ContactSyncState {
  return {
    permission: "unknown",
    enabled: false,
    lastSyncedAt: null,
    deviceContactCount: 0,
    importedCount: 0,
    source: "none",
    ...partial
  };
}

function initialsFor(name: string): string {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "??";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

function normalizePhoneNumber(value?: string): string {
  if (!value) {
    return "Private relay only";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "Private relay only";
  }

  return trimmed;
}

function stateForIndex(index: number): SyncedContact["matchState"] {
  if (index % 3 === 0) {
    return "on-sojourn";
  }

  if (index % 3 === 1) {
    return "invite-ready";
  }

  return "private-relay";
}

function noteForState(matchState: SyncedContact["matchState"]): string {
  switch (matchState) {
    case "on-sojourn":
      return "Trusted circle · already visible in the vault";
    case "invite-ready":
      return "Invite staged · quiet onboarding available";
    default:
      return "Private relay only · hidden outside your circle";
  }
}

function affinityForState(matchState: SyncedContact["matchState"]): SyncedContact["realmAffinity"] {
  switch (matchState) {
    case "on-sojourn":
      return "anonymous";
    case "invite-ready":
      return "messaging";
    default:
      return "social";
  }
}

function previewResult(permission: ContactSyncPermission, enabled: boolean): ContactSyncResult {
  return {
    contacts: previewContacts,
    state: createState({
      permission,
      enabled,
      lastSyncedAt: new Date().toISOString(),
      deviceContactCount: previewContacts.length,
      importedCount: previewContacts.length,
      source: "preview"
    })
  };
}

export function createEmptyContactSyncState(): ContactSyncState {
  return createState({});
}

export async function syncTrustedContacts(enabled: boolean): Promise<ContactSyncResult> {
  if (!enabled) {
    return { contacts: [], state: createState({ enabled: false }) };
  }

  if (Platform.OS === "web") {
    return previewResult("unavailable", true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let ContactsModule: any = null;

  try {
    ContactsModule = await import("expo-contacts" as string);
  } catch {
    return previewResult("unavailable", true);
  }

  const currentPermission = await ContactsModule.getPermissionsAsync();
  const permissionResponse =
    currentPermission.status === "granted"
      ? currentPermission
      : await ContactsModule.requestPermissionsAsync();

  if (permissionResponse.status !== "granted") {
    return {
      contacts: [],
      state: createState({
        permission: permissionResponse.status === "denied" ? "denied" : "unknown",
        enabled: true,
        source: "none"
      })
    };
  }

  const response = await ContactsModule.getContactsAsync({
    fields: [ContactsModule.Fields.Name, ContactsModule.Fields.PhoneNumbers],
    sort: ContactsModule.SortTypes.FirstName,
    pageSize: MAX_SYNCED_CONTACTS
  });

  const contacts = response.data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((contact: any) => Boolean(contact.name || contact.firstName || contact.lastName || contact.phoneNumbers?.length))
    .slice(0, MAX_SYNCED_CONTACTS)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((contact: any, index: number) => {
      const displayName =
        contact.name || [contact.firstName, contact.lastName].filter(Boolean).join(" ") || `Silent Contact ${index + 1}`;
      const matchState = stateForIndex(index);

      return {
        id: contact.id,
        displayName,
        initials: initialsFor(displayName),
        phoneNumber: normalizePhoneNumber(contact.phoneNumbers?.[0]?.number),
        trustNote: noteForState(matchState),
        matchState,
        realmAffinity: affinityForState(matchState),
        lastSeen: index === 0 ? "just now" : `${index + 1}h ago`,
        source: "device"
      } satisfies SyncedContact;
    });

  return {
    contacts,
    state: createState({
      permission: "granted",
      enabled: true,
      lastSyncedAt: new Date().toISOString(),
      deviceContactCount: response.data.length,
      importedCount: contacts.length,
      source: "device"
    })
  };
}
