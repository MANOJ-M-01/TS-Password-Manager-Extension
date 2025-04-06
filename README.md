### System requirements

- Node v23.11.0

### Reference

- https://alexleybourne.github.io/chrome-extension-icon-generator/

### Notes

- ✅ Your encryption, IndexedDB storage, etc., are all working fine.
- 🚫 But `chrome.storage.local` only exists when your code is executed **inside the extension environment** (i.e., after loading it from `chrome://extensions`).

### ✅ How to See `chrome.storage.local` Work

To test syncing with `chrome.storage.local`, follow these steps:

#### 1. Run a build

```bash
npm run build
```

#### 2. Open Chrome Extensions

Go to:  
`chrome://extensions`

#### 3. Enable Developer Mode (toggle top right)

#### 4. Click "Load unpacked"

Then **select the `dist/` folder** from your project.

> Make sure it contains the built files like `index.html`, `assets/`, `manifest.json`, etc.

#### 5. Click on your extension’s popup (icon next to the address bar)

Click **“TS Password Manager”** — now you should see: the Login page
