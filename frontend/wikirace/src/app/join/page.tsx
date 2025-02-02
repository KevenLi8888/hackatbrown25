"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinGame } from "@/services/gameService";
import { v4 as uuidv4 } from "uuid";

export default function Join() {
  const router = useRouter();
  const [gameCode, setGameCode] = useState("");
  const [error, setError] = useState("");
  const playerName = localStorage.getItem("playerName") || "Anonymous";

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) {
      setError("Please enter a game code");
      return;
    }

    try {
      const newPlayerId = uuidv4();
      const game = await joinGame(playerName, newPlayerId, gameCode);

      localStorage.setItem("playerId", newPlayerId);
      localStorage.setItem("playerName", playerName);

      router.push(`/lobby?code=${game.code}`);
    } catch (err) {
      setError("Failed to join game. Please check the game code.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join Game</h2>
          <p className="text-gray-600">Enter the game code to join</p>
          {error && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 py-2 px-3 rounded-lg">
              {error}
            </p>
          )}
        </div>

        <form onSubmit={handleJoinGame} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Game Code"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Join Game
            </button>

            <button
              onClick={() => router.back()}
              className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
