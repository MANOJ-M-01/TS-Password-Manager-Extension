import { getAllItems } from "./vaultStore";
import { decrypt } from "./crypto";

export const syncToChromeStorage = async () => {
  const items = await getAllItems();

  const decrypted = await Promise.all(
    items.map(async (item) => ({
      id: item.id,
      website: item.website,
      username: item.username,
      password: await decrypt(item.password),
      group: item.password,
      note: item.note,
    }))
  );

  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    chrome.storage.local.set({ vault: decrypted }, () => {
      console.log("[Vault] Synced to chrome.storage.local ✅");
    });
  } else {
    console.warn("[Vault] chrome.storage.local not available — skipping sync");
  }
};
