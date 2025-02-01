"use client";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [playerName, setPlayerName] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      localStorage.setItem("playerName", playerName.trim());
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
                }
              }}
            >
              Join Game
            </Link>

            <Link
              href="/lobby"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={(e) => {
                if (!playerName.trim()) {
                  e.preventDefault();
                  alert("Please enter your name first");
                }
              }}
            >
              Create Game
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
