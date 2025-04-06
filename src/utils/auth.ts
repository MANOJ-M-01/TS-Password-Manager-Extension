import { deriveSecretKey } from "./crypto";

const storage = chrome?.storage?.local;

export const isFirstTime = async (): Promise<boolean> => {
  if (!storage) {
    console.warn("chrome.storage.local not available");
    return false;
  }

  return new Promise((resolve) => {
    storage.get(["vaultUser"], (result) => {
      resolve(!result.vaultUser);
    });
  });
};

export const setupUser = async (
  username: string,
  password: string,
  key: string
): Promise<string> => {
  if (!storage) throw new Error("chrome.storage.local not available");

  const secret = await deriveSecretKey(password, key);

  return new Promise((resolve) => {
    storage.set({ vaultUser: { username, secret: secret.secret } }, () => {
      sessionStorage.setItem("vaultSecret", secret.secret);
      resolve(key);
    });
  });
};

export const verifyUser = async (
  username: string,
  password: string,
  key: string
): Promise<boolean> => {
  if (!storage) return false;

  return new Promise((resolve) => {
    storage.get(["vaultUser"], async (result) => {
      const vaultUser = result.vaultUser;

      if (!vaultUser || vaultUser.username !== username) {
        resolve(false);
        return;
      }

      const secret = await deriveSecretKey(password, key);
      if (secret.secret === vaultUser.secret) {
        sessionStorage.setItem("vaultSecret", secret.secret);
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export const getStoredUser = async (): Promise<{
  username: string;
  key: string;
} | null> => {
  if (!storage) return null;

  return new Promise((resolve) => {
    storage.get(["vaultUser"], (result) => {
      resolve(result.vaultUser || null);
    });
  });
};

export const isUnlocked = (): boolean => {
  return !!sessionStorage.getItem("vaultSecret");
};

export const logout = () => {
  sessionStorage.removeItem("vaultSecret");
  window.location.reload();
};
