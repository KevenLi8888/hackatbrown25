"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGame } from "@/services/gameService";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const router = useRouter();
  const [playerName, setPlayerName] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem("playerName", playerName.trim());
    }
  };

  const handleCreateGame = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      alert("Please enter your name first");
      return;
    }

    try {
      const newPlayerId = uuidv4();
      const game = await createGame(playerName, newPlayerId);

      localStorage.setItem("playerName", playerName.trim());
      localStorage.setItem("playerId", newPlayerId);
      router.push(`/lobby?code=${game.code}`);
    } catch (error) {
      console.error("Create game error:", error);
      alert("Failed to create game. Please try again.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">WikiRace</h1>
          <p className="text-lg text-gray-600">
            Race from one Wikipedia article to another using only hyperlinks!
          </p>
        </div>

        <form onSubmit={handleNameSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <Link
              href="/join"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
              onClick={(e) => {
                if (!playerName.trim()) {
                  e.preventDefault();
                  alert("Please enter your name first");
                } else {
                  localStorage.setItem("playerName", playerName.trim());
                }
              }}
            >
              Join Game
            </Link>

            <button
              onClick={handleCreateGame}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
