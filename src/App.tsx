import { useEffect, useState } from "react";
import { getAllItems, saveItem, VaultItem } from "./utils/vaultStore";
import { encrypt, decrypt } from "./utils/crypto";
import { v4 as uuidv4 } from "uuid";
import { syncToChromeStorage } from "./utils/sync";
function App() {
  const [vault, setVault] = useState<VaultItem[]>([]);

  const loadVault = async () => {
    const items = await getAllItems();
    const decrypted = await Promise.all(
      items.map(async (item) => ({
        ...item,
        password: await decrypt(item.password),
      }))
    );
    setVault(decrypted);
  };

  const handleAdd = async () => {
    const newItem: VaultItem = {
      id: uuidv4(),
      website: "www.iconfinder.com",
      username: "user@example.com",
      password: await encrypt("supersecurepassword123"),
    };

    await saveItem(newItem);
    await syncToChromeStorage();
    loadVault();
  };

  useEffect(() => {
    loadVault();
  }, []);

  return (
    <div className="w-80 p-4">
      <h1 className="text-xl font-bold mb-2">🔐 Vault</h1>
      <button
        className="bg-blue-600 text-white px-3 py-1 rounded mb-4"
        onClick={handleAdd}
      >
        + Add Dummy Entry
      </button>
      {vault.map((item) => (
        <div key={item.id} className="mb-2 border rounded p-2 bg-gray-100">
          <div className="font-semibold">{item.website}</div>
          <div className="text-sm text-gray-600">{item.username}</div>
          <div className="text-sm">{item.password}</div>
        </div>
      ))}
    </div>
  );
}

export default App;
