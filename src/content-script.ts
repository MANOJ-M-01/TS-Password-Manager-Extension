import { VaultItem } from "./types";

console.log("[PasswordManager] Content script loaded");

// Autofill helper
function fillInput(input: HTMLInputElement | null, value: string) {
  if (!input) return;
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

// Inline icon injection
function addInlineIcon(input: HTMLInputElement, type: "email" | "password") {
  const icon = document.createElement("span");
  icon.innerText = "🔐";
  icon.title = "Fill from Password Manager";
  icon.style.position = "absolute";
  icon.style.right = "8px";
  icon.style.top = "50%";
  icon.style.transform = "translateY(-50%)";
  icon.style.cursor = "pointer";
  icon.style.fontSize = "16px";
  icon.style.zIndex = "1000";

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.width = `${input.offsetWidth}px`;

  const parent = input.parentElement;
  if (parent) {
    parent.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    wrapper.appendChild(icon);
  }

  icon.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "REQUEST_VAULT" }, (response) => {
      const currentDomain = window.location.hostname;
      const match = response?.data.find((entry: VaultItem) =>
        currentDomain.includes(entry.website)
      );
      if (match) {
        if (type === "email") fillInput(input, match.email);
        else fillInput(input, match.password);
      }
    });
  });
}

// Main autofill logic
function tryAutofill() {
  const emailField = document.querySelector<HTMLInputElement>(
    'input[type="email"], input[name*=user], input[name*=email]'
  );
  const passwordField = document.querySelector<HTMLInputElement>(
    'input[type="password"]'
  );

  if (emailField && passwordField) {
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
          fillInput(emailField, matchingEntry.email);
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

    // Inject inline icons for manual trigger
    addInlineIcon(emailField, "email");
    addInlineIcon(passwordField, "password");
  }
}

// Listen to form submission for save prompt
document.addEventListener("submit", (event) => {
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const username = formData.get("username") || formData.get("email");
  const password = formData.get("password");

  if (username && password) {
    chrome.runtime.sendMessage({
      type: "PROMPT_SAVE_CREDENTIALS",
      data: {
        website: window.location.hostname,
        email: username.toString(),
        password: password.toString(),
      },
    });
  }
});

// Padding override to make room for the icon
const style = document.createElement("style");
style.textContent = `
  input {
    padding-right: 24px !important;
  }
`;
document.head.appendChild(style);

window.addEventListener("load", () => {
  setTimeout(tryAutofill, 500); // slight delay for inputs to load
});
