import { VaultItem } from "./types";

console.log("[PasswordManager] Content script loaded");

// Helper to autofill fields
function fillInput(input: HTMLInputElement | null, value: string) {
  if (!input) return;
  input.focus();
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

function addIconToField(input: HTMLInputElement, onClick: () => void) {
  const icon = document.createElement("img");
  icon.src =
    "https://www.iconfinder.com/static/img/favicons/favicon-194x194.png?bf2736d2f8";
  icon.style.position = "absolute";
  icon.style.right = "8px";
  icon.style.top = "50%";
  icon.style.transform = "translateY(-50%)";
  icon.style.cursor = "pointer";
  icon.style.width = "16px";
  icon.style.height = "16px";
  icon.style.zIndex = "1000";

  icon.addEventListener("click", onClick);

  const wrapper = document.createElement("div");
  wrapper.style.position = "relative";
  wrapper.style.display = "inline-block";
  wrapper.style.width = `${input.offsetWidth}px`;

  input.parentElement?.insertBefore(wrapper, input);
  wrapper.appendChild(input);
  wrapper.appendChild(icon);
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

    // Inject icon in username field to trigger autofill manually
    addIconToField(usernameField, () => {
      chrome.runtime.sendMessage({ type: "REQUEST_VAULT" }, (response) => {
        const currentDomain = window.location.hostname;
        const match = response?.data.find((entry: VaultItem) =>
          currentDomain.includes(entry.website)
        );
        if (match) {
          fillInput(usernameField, match.username);
          fillInput(passwordField, match.password);
        }
      });
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

const style = document.createElement("style");
style.textContent = `
  input {
    padding-right: 24px !important;
  }
`;
document.head.appendChild(style);
