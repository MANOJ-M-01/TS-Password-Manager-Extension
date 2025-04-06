import { useState } from "react";
import { setupUser } from "./utils/auth";
import { generateKey } from "./utils/hash";

interface Props {
  onComplete: () => void;
}

export default function SetupForm({ onComplete }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [key] = useState(generateKey());
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    await setupUser(username, password, key);
    onComplete();
  };

  return (
    <div className="p-4 w-96 text-sm">
      <h1 className="text-xl font-bold mb-3">🔐 Setup Vault</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
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
        <div className="p-2 border rounded bg-gray-100">
          <p className="text-xs mb-1 font-semibold">Your 12-digit Vault Key:</p>
          <p className="font-mono text-blue-700">{key}</p>
          <p className="text-xs text-red-600 mt-1">
            Save this key safely. It will not be shown again.
          </p>
        </div>

        {error && <p className="text-red-500 text-xs">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded"
        >
          Setup Vault
        </button>
      </form>
    </div>
  );
}
