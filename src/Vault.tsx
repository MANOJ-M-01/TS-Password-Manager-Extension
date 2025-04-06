import { useEffect, useState } from "react";
import {
  getAllItems,
  saveItem,
  updateItem,
  deleteItem,
} from "./utils/vaultStore";
import { VaultItem } from "./types";
import { encrypt, decrypt } from "./utils/crypto";
import { v4 as uuidv4 } from "uuid";
import { syncToChromeStorage } from "./utils/sync";
import { Eye, EyeOff, ClipboardCopy, Trash, Edit } from "lucide-react";

function Vault() {
  const [vault, setVault] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [showPasswordMap, setShowPasswordMap] = useState<
    Record<string, boolean>
  >({});
  const [newEntry, setNewEntry] = useState({
    website: "",
    username: "",
    password: "",
    group: "",
    note: "",
  });

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
    if (!newEntry.website || !newEntry.username || !newEntry.password) {
      alert("Website, username, and password are required.");
      return;
    }

    const newItem: VaultItem = {
      id: uuidv4(),
      website: newEntry.website,
      username: newEntry.username,
      password: await encrypt(newEntry.password),
      group: newEntry.group,
      note: newEntry.note,
    };

    await saveItem(newItem);
    await syncToChromeStorage();
    setNewEntry({
      website: "",
      username: "",
      password: "",
      group: "",
      note: "",
    });
    loadVault();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteItem(id);
      await syncToChromeStorage();
      loadVault();
    }
  };

  const handleEdit = async (item: VaultItem) => {
    const updatedWebsite = prompt("Edit website", item.website);
    const updatedUsername = prompt("Edit username", item.username);
    const updatedPassword = prompt("Edit password", item.password);
    const updatedGroup = prompt("Edit group", item.group || "");
    const updatedNote = prompt("Edit note", item.note || "");

    if (
      updatedWebsite !== null &&
      updatedUsername !== null &&
      updatedPassword !== null
    ) {
      const updatedItem: VaultItem = {
        ...item,
        website: updatedWebsite,
        username: updatedUsername,
        password: await encrypt(updatedPassword),
        group: updatedGroup || "",
        note: updatedNote || "",
      };

      await updateItem(updatedItem);
      await syncToChromeStorage();
      loadVault();
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleVisibility = (id: string) => {
    setShowPasswordMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    loadVault();
  }, []);

  const filteredVault = vault.filter(
    (item) =>
      item.website.toLowerCase().includes(search.toLowerCase()) ||
      item.username.toLowerCase().includes(search.toLowerCase()) ||
      (item.group && item.group.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filteredVault.reduce((acc, item) => {
    const key = item.group || "Ungrouped";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, VaultItem[]>);

  return (
    <div className="w-96 p-4 text-sm">
      {/* <h1 className="text-xl font-bold mb-2">🔐 Vault</h1> */}

      <input
        type="text"
        placeholder="Search..."
        className="w-full mb-3 p-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="space-y-2 mb-4">
        <input
          type="text"
          placeholder="Website"
          value={newEntry.website}
          onChange={(e) =>
            setNewEntry({ ...newEntry, website: e.target.value })
          }
          className="w-full px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Username"
          value={newEntry.username}
          onChange={(e) =>
            setNewEntry({ ...newEntry, username: e.target.value })
          }
          className="w-full px-2 py-1 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={newEntry.password}
          onChange={(e) =>
            setNewEntry({ ...newEntry, password: e.target.value })
          }
          className="w-full px-2 py-1 border rounded"
        />
        <input
          type="text"
          placeholder="Group (optional)"
          value={newEntry.group}
          onChange={(e) => setNewEntry({ ...newEntry, group: e.target.value })}
          className="w-full px-2 py-1 border rounded"
        />
        <textarea
          placeholder="Secure Note (optional)"
          value={newEntry.note}
          onChange={(e) => setNewEntry({ ...newEntry, note: e.target.value })}
          className="w-full px-2 py-1 border rounded"
          rows={2}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded w-full"
          onClick={handleAdd}
        >
          ➕ Add Entry
        </button>
      </div>

      {Object.keys(grouped).map((group) => (
        <div key={group} className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1">📂 {group}</h2>
          {grouped[group].map((item) => (
            <div
              key={item.id}
              className="mb-2 border rounded p-2 bg-white shadow"
            >
              <div className="flex justify-between">
                <div className="font-semibold">{item.website}</div>
                <div className="flex gap-2">
                  <Edit
                    size={16}
                    className="cursor-pointer text-blue-600"
                    onClick={() => handleEdit(item)}
                  />
                  <Trash
                    size={16}
                    className="cursor-pointer text-red-600"
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>
              <div className="text-gray-600">{item.username}</div>
              <div className="flex items-center gap-2">
                <input
                  className="bg-transparent border-none outline-none w-full"
                  type={showPasswordMap[item.id] ? "text" : "password"}
                  readOnly
                  value={item.password}
                />
                {showPasswordMap[item.id] ? (
                  <EyeOff
                    size={16}
                    className="cursor-pointer"
                    onClick={() => toggleVisibility(item.id)}
                  />
                ) : (
                  <Eye
                    size={16}
                    className="cursor-pointer"
                    onClick={() => toggleVisibility(item.id)}
                  />
                )}
                <ClipboardCopy
                  size={16}
                  className="cursor-pointer text-green-600"
                  onClick={() => handleCopy(item.password)}
                />
              </div>
              {item.note && (
                <div className="mt-1 text-xs text-gray-500 italic">
                  📝 {item.note}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Vault;
