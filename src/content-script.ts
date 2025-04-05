import { VaultItem } from "./types";

console.log("[PasswordManager] Content script loaded");

// Helper to autofill fields
function fillInput(input: HTMLInputElement | null, value: string) {
  if (!input) return;
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Try to autofill if login form is detected
function tryAutofill() {
  const usernameField = document.querySelector<HTMLInputElement>(
    'input[type="email"], input[name*=user], input[name*=email]'
  );
  const passwordField = document.querySelector<HTMLInputElement>(
    'input[type="password"]'
  );

  if (usernameField && passwordField) {
    chrome.runtime.sendMessage({ type: "REQUEST_VAULT" }, (response) => {
      console.log("[PasswordManager] Vault response:", response);

      if (response?.success && response.data?.length > 0) {
        const currentDomain = window.location.hostname;
        const matchingEntry = response.data.find(
          (entry: VaultItem) =>
            entry.website.includes(currentDomain) ||
            currentDomain.includes(entry.website)
        );

        if (matchingEntry) {
          fillInput(usernameField, matchingEntry.username);
          fillInput(passwordField, matchingEntry.password);
          console.log(
            "[PasswordManager] Autofilled from vault:",
            matchingEntry.website
          );
        } else {
          console.warn(
            "[PasswordManager] No matching entry for domain:",
            currentDomain
          );
        }
      } else {
        console.warn("[PasswordManager] No vault data found.");
      }
    });
  }
}

// Detect form submission and extract credentials
document.addEventListener("submit", (event) => {
  console.log("Login Submit Event");
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const username = formData.get("username") || formData.get("email");
  const password = formData.get("password");

  if (username && password) {
    console.log("Login Submit Field Done");
    chrome.runtime.sendMessage({
      type: "PROMPT_SAVE_CREDENTIALS",
      data: {
        website: window.location.hostname,
        username: username.toString(),
        password: password.toString(),
      },
    });
  }
});

window.addEventListener("load", () => {
  setTimeout(tryAutofill, 500); // slight delay helps
});
