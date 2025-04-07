import { useEffect, useState } from "react";
import { isUnlocked, isFirstTime, logout } from "./utils/auth";
import SetupForm from "./SetupForm";
import UnlockForm from "./UnlockForm";
import Vault from "./Vault";

function App() {
  const [screen, setScreen] = useState<
    "loading" | "setup" | "unlock" | "vault"
  >("loading");

  useEffect(() => {
    const init = async () => {
      const firstTime = await isFirstTime();
      if (firstTime) setScreen("setup");
      else if (await isUnlocked()) setScreen("vault");
      else setScreen("unlock");
    };
    init();
  }, []);
  if (screen === "loading") return <div className="p-4">Loading...</div>;
  if (screen === "setup")
    return <SetupForm onComplete={() => setScreen("vault")} />;
  if (screen === "unlock")
    return <UnlockForm onSuccess={() => setScreen("vault")} />;
  return <VaultBox onLogout={logout} />;
}

export default App;

const VaultBox = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="w-full p-4 text-sm">
      <div className="flex justify-between items-center align-center mb-6">
        <div className="flex items-center text-2xl font-semibold text-gray-900 dark:text-white">
          <img className="w-8 h-8 mr-2" src="/logo.svg" alt="logo" />
          TS Vault
        </div>
        <button
          onClick={onLogout}
          className="bg-red-600 text-white text-xs px-2 py-1 rounded"
        >
          🔒 Logout
        </button>
      </div>
      <Vault />
    </div>
  );
};
