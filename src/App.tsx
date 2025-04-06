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
    <div className="w-96 p-4 text-sm">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-xl font-bold">🔐 Vault</h1>
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
