import { encrypt } from "./utils/crypto";
import { saveItem } from "./utils/vaultStore";
import { syncToChromeStorage } from "./utils/sync";
import { v4 as uuidv4 } from "uuid";

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log(sender);
  // 1. Vault request
  if (msg.type === "REQUEST_VAULT") {
    chrome.storage.local.get(["vault"], (result) => {
      sendResponse({ success: true, data: result.vault || [] });
    });
    return true; // Keeps message channel open for async sendResponse
  }

  // 2. Prompt to save credentials
  if (msg.type === "PROMPT_SAVE_CREDENTIALS") {
    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon128.png"),
      title: "Save Login?",
      message: `Save login for ${msg.data.website}?`,
      buttons: [{ title: "Save" }],
      priority: 2,
    });

    // Temporarily store data for when user clicks Save
    chrome.storage.local.set({ _pendingSave: msg.data });
  }
});

// Handle notification Save click
chrome.notifications.onButtonClicked.addListener(async (notifId, btnIdx) => {
  if (btnIdx === 0) {
    const { _pendingSave } = await chrome.storage.local.get("_pendingSave");

    if (_pendingSave) {
      const newItem = {
        id: uuidv4(),
        website: _pendingSave.website,
        email: _pendingSave.email,
        password: await encrypt(_pendingSave.password),
      };

      await saveItem(newItem);
      await syncToChromeStorage();
      chrome.storage.local.remove("_pendingSave");
      chrome.notifications.clear(notifId);
    }
  }
});
