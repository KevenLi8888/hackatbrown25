"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getGameInfo, resetGame } from "@/services/gameService";
import type { Game } from "@/types/game";

export default function Stats() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState("");
  const gameCode = searchParams.get("code") || "";
  const playerId = localStorage.getItem("playerId") || "";

  useEffect(() => {
    const pollGameInfo = async () => {
      try {
        const gameData = await getGameInfo(gameCode);
        setGame(gameData);

        // If game is reset, go back to lobby
        if (gameData.state === "waiting") {
          router.push(`/lobby?code=${gameCode}`);
        }
      } catch (error) {
        console.error("Failed to get game updates:", error);
        setError("Failed to load game stats");
      }
    };

    pollGameInfo();
    const interval = setInterval(pollGameInfo, 1000);
    return () => clearInterval(interval);
  }, [gameCode, router]);

  const handleReset = async () => {
    try {
      await resetGame(gameCode);
    } catch (error) {
      console.error("Failed to reset game:", error);
      setError("Failed to reset game");
    }
  };

  if (!game) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const winner = game.players.find(p => p.isWinner);

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">Game Results</h1>
        
        {winner && (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold">
              🏆 Winner: {winner.name} 🏆
            </h2>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-xl font-semibold">Player Paths:</h3>
          {game.players.map((player) => (
            <div key={player.id} className="border rounded p-4">
              <h4 className="font-semibold mb-2">
                {player.name} {player.isWinner && "🏆"}
              </h4>
              <div className="space-y-1">
                {player.paths.map((path, index) => (
                  <div key={index} className="flex items-center">
                    <span>{index + 1}.</span>
                    <span className="ml-2">{path}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {game.players.find(p => p.id === playerId)?.isLeader ? (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleReset}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        ) : (
          <div className="mt-8 flex justify-center items-center bg-gray-50 rounded-lg py-3 px-6">
            <div className="animate-pulse mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
            <span className="text-gray-600">Waiting for the leader to restart...</span>
          </div>
        )}
      </div>
    </div>
  );
} 