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
    email: "",
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

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEntry.website || !newEntry.email || !newEntry.password) {
      alert("Website, email, and password are required.");
      return;
    }

    const newItem: VaultItem = {
      id: uuidv4(),
      website: newEntry.website,
      email: newEntry.email,
      password: await encrypt(newEntry.password),
      group: newEntry.group,
      note: newEntry.note,
    };

    await saveItem(newItem);
    await syncToChromeStorage();
    setNewEntry({
      website: "",
      email: "",
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
    const updatedEmail = prompt("Edit email", item.email);
    const updatedPassword = prompt("Edit password", item.password);
    const updatedGroup = prompt("Edit group", item.group || "");
    const updatedNote = prompt("Edit note", item.note || "");

    if (
      updatedWebsite !== null &&
      updatedEmail !== null &&
      updatedPassword !== null
    ) {
      const updatedItem: VaultItem = {
        ...item,
        website: updatedWebsite,
        email: updatedEmail,
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
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      (item.group && item.group.toLowerCase().includes(search.toLowerCase()))
  );

  const grouped = filteredVault.reduce((acc, item) => {
    const key = item.group || "Ungrouped";
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, VaultItem[]>);

  return (
    <div className="w-full p-4 text-sm">
      <div className="space-y-2 mb-8">
        <form className="space-y-4 md:space-y-6" onSubmit={handleAdd}>
          <div>
            <input
              type="text"
              placeholder="Website"
              value={newEntry.website}
              onChange={(e) =>
                setNewEntry({ ...newEntry, website: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Email"
              value={newEntry.email}
              onChange={(e) =>
                setNewEntry({ ...newEntry, email: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={newEntry.password}
              onChange={(e) =>
                setNewEntry({ ...newEntry, password: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Group (optional)"
              value={newEntry.group}
              onChange={(e) =>
                setNewEntry({ ...newEntry, group: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <textarea
              placeholder="Secure Note (optional)"
              value={newEntry.note}
              onChange={(e) =>
                setNewEntry({ ...newEntry, note: e.target.value })
              }
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              rows={2}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Add Entry
            </button>
          </div>
        </form>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {Object.keys(grouped).map((group) => (
        <div key={group} className="mb-4">
          <h2 className="font-semibold text-gray-700 mb-1 dark:text-white">
            📂 {group}
          </h2>
          {grouped[group].map((item) => (
            <div
              key={item.id}
              className="mb-2 mt-2 border rounded p-2 bg-white shadow bg-gray-50 border border-gray-300 text-gray-900 dark:bg-gray-700 dark:text-white"
            >
              <div className="flex justify-between mb-2">
                <div className="font-semibold">{item.website}</div>
                <div className="flex gap-2">
                  <Edit
                    size={16}
                    className="cursor-pointer text-blue-600 dark:text-white"
                    onClick={() => handleEdit(item)}
                  />
                  <Trash
                    size={16}
                    className="cursor-pointer text-red-600 dark:text-red-500"
                    onClick={() => handleDelete(item.id)}
                  />
                </div>
              </div>
              <div className="text-gray-600 dark:text-white  mb-2">
                {item.email}
              </div>
              <div className="flex items-center gap-2  mb-2">
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
                    className="cursor-pointer dark:text-white"
                    onClick={() => toggleVisibility(item.id)}
                  />
                )}
                <ClipboardCopy
                  size={16}
                  className="cursor-pointer text-green-600 dark:text-white"
                  onClick={() => handleCopy(item.password)}
                />
              </div>
              {item.note && (
                <div className="mt-1 text-xs text-gray-500 dark:text-white italic mb-2">
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
