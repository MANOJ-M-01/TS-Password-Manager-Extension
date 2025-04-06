# 🔐 TS Password Manager Extension

A secure, modern password manager Chrome extension built with **TypeScript**, **React**, and **Vite**, featuring **military-grade encryption**, grouped vaults, secure notes, inline icons, and cloud sync support.

---

## 🚀 Features

- AES-GCM encryption using credentials-derived keys
- Password grouping & search functionality
- Secure notes
- Unlock screen on every browser restart
- Autofill icons and password visibility toggle
- Chrome storage sync
- ✍️ Supports dark mode, keyboard shortcuts, and more

---

## 🛠 System Requirements

- **Node.js** v23.11.0 or later
- Modern browser (Chrome-based)

---

## 📦 Development Setup

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run dev
```

> Opens the extension as a webpage for development, but `chrome.storage.local` won’t work here.

---

## 🧪 How to Test `chrome.storage.local` (Actual Extension Behavior)

To properly test features like syncing and unlock security, you must load the **production build** in Chrome:

### 1. Build the extension

```bash
npm run build
```

### 2. Open Chrome Extensions

Go to:  
`chrome://extensions`

### 3. Enable Developer Mode

Toggle it in the top right corner.

### 4. Load the unpacked extension

Click **"Load unpacked"** and select the `dist/` folder (generated from `npm run build`).

Ensure it contains:
- `index.html`
- `assets/` folder
- `manifest.json`

### 5. Use the Extension

Click the extension icon (🔐) in Chrome.  
You should now see the **setup or unlock screen**.

---

## 🔗 Reference

- Chrome Extension Icon Generator  
  https://alexleybourne.github.io/chrome-extension-icon-generator/

---

## ⚠ Notes

- ✅ **Encryption, session unlocking, and vault storage** work as expected.
- 🚫 **`chrome.storage.local` is only accessible** inside the Chrome Extension environment — not in dev server mode.
