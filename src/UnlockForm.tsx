import { useState } from "react";
import { verifyUser } from "./utils/auth";

interface Props {
  onSuccess: () => void;
}

export default function UnlockForm({ onSuccess }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await verifyUser(username, password, key);
    if (result) {
      onSuccess();
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="p-4 w-96 text-sm">
      <h1 className="text-xl font-bold mb-3">🔓 Unlock Vault</h1>
      <form onSubmit={handleUnlock} className="space-y-3">
        <input
          className="w-full p-2 border rounded"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-full p-2 border rounded"
          placeholder="12-digit Key"
          value={key}
          onChange={(e) => setKey(e.target.value)}
        />

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Unlock
        </button>
      </form>
    </div>
  );
}
