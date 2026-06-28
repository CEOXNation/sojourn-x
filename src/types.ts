export type RealmKey =
  | "anonymous"
  | "social"
  | "messaging"
  | "marketplace"
  | "spiritual"
  | "growth";

export type Realm = {
  key: RealmKey;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  promise: string;
  features: string[];
};

export type NavTab = "Vault" | "Realms" | "Messages" | "Market" | "Growth";