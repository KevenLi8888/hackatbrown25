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

      // Store player info
      localStorage.setItem("playerId", newPlayerId);
      localStorage.setItem("playerName", playerName);

      // Navigate to lobby
      router.push(`/lobby?code=${game.code}`);
    } catch (err) {
      setError("Failed to join game. Please check the game code.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Join Game</h2>
          <p className="mt-2 text-gray-600">Enter the game code to join</p>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </div>

        <form onSubmit={handleJoinGame}>
          <input
            type="text"
            placeholder="Game Code"
            value={gameCode}
            onChange={(e) => setGameCode(e.target.value.toUpperCase())}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm mb-4"
            required
          />
          <div className="space-y-4 mt-4">
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
          </div>
        </form>
      </div>
    </div>
  );
}
