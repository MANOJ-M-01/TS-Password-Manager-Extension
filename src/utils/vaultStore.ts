import { openDB } from "idb";
import { DB_NAME, STORE_NAME } from "../config";
import { VaultItem } from "../types";

// Open IndexedDB
export const getVaultDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

// Save or update an item
export const saveItem = async (item: VaultItem) => {
  const db = await getVaultDB();
  await db.put(STORE_NAME, item);
};

// Get all saved items
export const getAllItems = async (): Promise<VaultItem[]> => {
  const db = await getVaultDB();
  return await db.getAll(STORE_NAME);
};

// Delete a specific item by ID
export const deleteItem = async (id: string) => {
  const db = await getVaultDB();
  await db.delete(STORE_NAME, id);
};

// Optional: Clear the entire vault (useful for reset or debug)
export const clearVault = async () => {
  const db = await getVaultDB();
  await db.clear(STORE_NAME);
};

// Get a single item
export const getItem = async (id: string): Promise<VaultItem | undefined> => {
  const db = await getVaultDB();
  return await db.get(STORE_NAME, id);
};

export const updateItem = async (item: VaultItem) => {
  const db = await getVaultDB();
  await db.put(STORE_NAME, { ...item, synced: false }); // Mark as needing sync
};

// Future cloud sync placeholder
export const syncWithCloud = async () => {
  console.log("[Cloud Sync] Feature disabled. Coming soon...");
};
