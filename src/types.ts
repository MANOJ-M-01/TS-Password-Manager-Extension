export interface VaultItem {
  id: string;
  website: string;
  username: string;
  password: string;
  group?: string;
  note?: string;
  synced?: boolean; // For future cloud sync
}
