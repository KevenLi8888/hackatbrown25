"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  isLeader: boolean;
}

export default function Lobby() {
  const router = useRouter();
  const [startArticle, setStartArticle] = useState("");
  const [targetArticle, setTargetArticle] = useState("");
  const [gameCode] = useState(() =>
    Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [players, setPlayers] = useState<Player[]>([
    // Temporary mock data - replace with real player data
    { id: "1", name: "You (Party Leader)", isLeader: true },
  ]);

  const handleStartGame = () => {
    if (!startArticle || !targetArticle) {
      alert("Please set both start and target articles");
      return;
    }
    // TODO: Notify other players and start game
    router.push(
      `/game?start=${startArticle}&target=${targetArticle}&code=${gameCode}`
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Game Lobby</h2>
          <p className="mt-2 text-gray-600">Game Code: {gameCode}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Game Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Game Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="start-article"
                  className="block text-sm font-medium text-gray-700"
                >
                  Start Article
                </label>
                <input
                  id="start-article"
                  type="text"
                  value={startArticle}
                  onChange={(e) => setStartArticle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Coffee"
                />
              </div>
              <div>
                <label
                  htmlFor="target-article"
                  className="block text-sm font-medium text-gray-700"
                >
                  Target Article
                </label>
                <input
                  id="target-article"
                  type="text"
                  value={targetArticle}
                  onChange={(e) => setTargetArticle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Moon"
                />
              </div>
            </div>
          </div>

          {/* Players List */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Players
            </h3>
            <div className="space-y-2">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                >
                  <span className="text-gray-900">{player.name}</span>
                  {player.isLeader && (
                    <span className="text-sm text-blue-600 font-medium">
                      Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => navigator.clipboard.writeText(gameCode)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Copy Game Code
          </button>
          <button
            onClick={handleStartGame}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
