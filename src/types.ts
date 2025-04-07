export interface VaultItem {
  id: string;
  website: string;
  email: string;
  password: string;
  group?: string;
  note?: string;
  synced?: boolean; // For future cloud sync
}
