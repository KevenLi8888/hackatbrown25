"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchWikipediaArticle } from "@/utils/wikipedia";
import {
  createGame,
  joinGame,
  leaveGame,
  startGame,
  getGameInfo,
} from "@/services/gameService";
import { v4 as uuidv4 } from "uuid";

interface Player {
  id: string;
  name: string;
  isLeader: boolean;
}

export default function Lobby() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [startArticle, setStartArticle] = useState("");
  const [targetArticle, setTargetArticle] = useState("");
  const [startSuggestions, setStartSuggestions] = useState<any[]>([]);
  const [targetSuggestions, setTargetSuggestions] = useState<any[]>([]);
  const [gameCode, setGameCode] = useState(
    () => searchParams.get("code") || ""
  );
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [playerName] = useState(
    () => localStorage.getItem("playerName") || "Anonymous"
  );
  const [isLeaving, setIsLeaving] = useState(false);
  const [playerId] = useState(
    () =>
      localStorage.getItem("playerId") ||
      Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const [error, setError] = useState("");

  useEffect(() => {
    // Store the playerId for future use
    localStorage.setItem("playerId", playerId);

    const initGame = async () => {
      try {
        const existingCode = searchParams.get("code");
        if (!existingCode) return;

        const game = await getGameInfo(gameCode);
        setGameCode(game.code);
        setPlayers(game.players);

        // Check if current player is the leader
        const isCurrentPlayerLeader =
          game.players.find((p) => p.id === playerId)?.isLeader || false;
        setIsLeader(isCurrentPlayerLeader);

        // Only set articles if they exist
        if (game.startArticle) setStartArticle(game.startArticle);
        if (game.targetArticle) setTargetArticle(game.targetArticle);
      } catch (error) {
        console.error("Failed to initialize game:", error);
        router.push("/");
      }
    };

    initGame();

    // Only run cleanup when actually leaving
    return () => {
      if (isLeaving) {
        leaveGame(gameCode, playerId);
      }
    };
  }, [gameCode, playerName, router, isLeaving, playerId, searchParams]);

  // Search Wikipedia as user types
  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (startArticle) {
        searchWikipediaArticle(startArticle).then(setStartSuggestions);
      }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [startArticle]);

  useEffect(() => {
    const searchTimer = setTimeout(() => {
      if (targetArticle) {
        searchWikipediaArticle(targetArticle).then(setTargetSuggestions);
      }
    }, 300);
    return () => clearTimeout(searchTimer);
  }, [targetArticle]);

  useEffect(() => {
    const pollGameInfo = async () => {
      try {
        const game = await getGameInfo(gameCode);
        setPlayers(game.players);
        if (game.state === "inProgress") {
          router.push(
            `/game?start=${game.startArticle}&target=${game.targetArticle}&code=${gameCode}`
          );
        }
      } catch (error) {
        console.error("Failed to get game updates:", error);
        // Game not found (probably closed by leader)
        alert("Game has been closed by the leader");
        router.push("/");
      }
    };

    const interval = setInterval(pollGameInfo, 1000);
    return () => clearInterval(interval);
  }, [gameCode, router]);

  const handleStartGame = async () => {
    if (!startArticle || !targetArticle) {
      alert("Please set both start and target articles");
      return;
    }

    try {
      await startGame(gameCode, startArticle, targetArticle);
    } catch (error) {
      console.error("Failed to start game:", error);
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveGame(gameCode, playerId);
      router.push("/");
    } catch (error) {
      console.error("Failed to leave game:", error);
      setIsLeaving(false);
    }
  };

  // const handleCreateGame = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     const newPlayerId = uuidv4();
  //     const game = await createGame(playerName, newPlayerId);

  //     // Update localStorage
  //     localStorage.setItem("playerId", newPlayerId);
  //     localStorage.setItem("playerName", playerName);

  //     // Update state directly
  //     setGameCode(game.code);
  //     setPlayers(game.players);
  //     setIsLeader(true);

  //     // Update URL without reload
  //     window.history.replaceState({}, "", `/lobby?code=${game.code}`);
  //   } catch (err) {
  //     setError("Failed to create game");
  //   }
  // };

  // const handleJoinGame = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   try {
  //     const newPlayerId = uuidv4();
  //     const game = await joinGame(playerName, newPlayerId, gameCode);

  //     // Update localStorage
  //     localStorage.setItem("playerId", newPlayerId);
  //     localStorage.setItem("playerName", playerName);

  //     // Update state directly
  //     setGameCode(game.code);
  //     setPlayers(game.players);
  //     setIsLeader(
  //       game.players.find((p) => p.id === newPlayerId)?.isLeader || false
  //     );

  //     // Update URL without reload
  //     window.history.replaceState({}, "", `/lobby?code=${game.code}`);
  //   } catch (err) {
  //     setError("Failed to join game");
  //   }
  // };

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
              <div className="relative">
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
                  disabled={!isLeader}
                />
                {startSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg">
                    {startSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.pageid}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setStartArticle(suggestion.title);
                          setStartSuggestions([]);
                        }}
                      >
                        {suggestion.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
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
                  disabled={!isLeader}
                />
                {targetSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg">
                    {targetSuggestions.map((suggestion) => (
                      <div
                        key={suggestion.pageid}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          setTargetArticle(suggestion.title);
                          setTargetSuggestions([]);
                        }}
                      >
                        {suggestion.title}
                      </div>
                    ))}
                  </div>
                )}
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
            onClick={handleLeave}
            className="px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Leave Game
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(gameCode)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Copy Game Code
          </button>
          {isLeader && (
            <button
              onClick={handleStartGame}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
