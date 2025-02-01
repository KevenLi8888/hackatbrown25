"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinGame() {
  const [gameCode, setGameCode] = useState("");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Check if game exists
    const res = await fetch(`/api/game?code=${gameCode}`);
    if (!res.ok) {
      alert("Game not found. Please check the code and try again.");
      return;
    }
    router.push(`/lobby?code=${gameCode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join Game</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleJoin}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="game-code" className="sr-only">
                Game Code
              </label>
              <input
                id="game-code"
                name="code"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Game Code"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Join Game
          </button>
          <button
            onClick={() => router.back()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
}
