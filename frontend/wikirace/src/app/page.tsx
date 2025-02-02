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
      console.log("Creating game with:", { playerName, newPlayerId }); // Debug log
      const game = await createGame(playerName, newPlayerId);

      localStorage.setItem("playerName", playerName.trim());
      localStorage.setItem("playerId", newPlayerId);
      router.push(`/lobby?code=${game.code}`);
    } catch (error) {
      console.error("Create game error:", error); // Log the actual error
      alert("Failed to create game. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">WikiRace</h1>
          <p className="text-gray-600 mb-8">
            Race from one Wikipedia article to another using only hyperlinks!
          </p>
        </div>
        <form onSubmit={handleNameSubmit}>
          <div>
            <input
              type="text"
              placeholder="Enter your name"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-4 mt-4">
            <Link
              href="/join"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
