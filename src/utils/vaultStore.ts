import { openDB } from "idb";

export interface VaultItem {
  id: string;
  website: string;
  username: string;
  password: string; // This will be encrypted
}

const DB_NAME = "ts-password-vault";
const STORE_NAME = "vault";

export const getVaultDB = async () => {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
};

export const saveItem = async (item: VaultItem) => {
  const db = await getVaultDB();
  await db.put(STORE_NAME, item);
};

export const getAllItems = async (): Promise<VaultItem[]> => {
  const db = await getVaultDB();
  return await db.getAll(STORE_NAME);
};

export const deleteItem = async (id: string) => {
  const db = await getVaultDB();
  await db.delete(STORE_NAME, id);
};
