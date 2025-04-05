let vault = [];

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "REQUEST_VAULT") {
    chrome.storage.local.get(["vault"], (result) => {
      sendResponse({ success: true, data: result.vault || [] });
    });
    return true; // keeps the message channel open for async response
  }
});
