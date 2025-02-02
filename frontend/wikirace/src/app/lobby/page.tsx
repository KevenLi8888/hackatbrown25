"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { searchWikipediaArticle, getRandomWikipediaArticle } from "@/utils/wikipedia";
import {
  createGame,
  joinGame,
  leaveGame,
  startGame,
  getGameInfo,
  updateGame,
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
  const [playerName, setPlayerName] = useState("Anonymous");
  const [isLeaving, setIsLeaving] = useState(false);
  const [playerId, setPlayerId] = useState("");
  const [error, setError] = useState("");
  const [showStartSuggestions, setShowStartSuggestions] = useState(false);
  const [showTargetSuggestions, setShowTargetSuggestions] = useState(false);

  // Add refs to track input focus
  const startInputRef = useRef<HTMLInputElement>(null);
  const targetInputRef = useRef<HTMLInputElement>(null);

  // Add this new useEffect to safely initialize localStorage-dependent values
  useEffect(() => {
    setPlayerName(localStorage.getItem("playerName") || "Anonymous");
    setPlayerId(
      localStorage.getItem("playerId") ||
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
  }, []);

  useEffect(() => {
    // Only proceed if playerId is set
    if (!playerId) return;

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

  // Modify the polling effect
  useEffect(() => {
    const pollGameInfo = async () => {
      try {
        const game = await getGameInfo(gameCode);
        try {
          setPlayers(game.players);
        } catch (error) {
          router.push("/");
        }

        // Only update articles if input is not focused and value is different
        if (
          !startInputRef.current?.matches(":focus") &&
          game.startArticle !== startArticle
        ) {
          setStartArticle(game.startArticle);
        }
        if (
          !targetInputRef.current?.matches(":focus") &&
          game.targetArticle !== targetArticle
        ) {
          setTargetArticle(game.targetArticle);
        }

        if (game.state === "playing") {
          router.push(
            `/game?start=${game.startArticle}&target=${game.targetArticle}&code=${gameCode}`
          );
        }
      } catch (error) {
        console.error("Failed to get game updates:", error);
        alert("Game has been closed by the leader");
        router.push("/");
      }
    };

    const interval = setInterval(pollGameInfo, 1000);
    return () => clearInterval(interval);
  }, [gameCode, router, startArticle, targetArticle]);

  // Add this useEffect to get random articles when creating a new game
  useEffect(() => {
    const initializeRandomArticles = async () => {
      // Only get random articles if we're the leader and there are no articles set
      if (isLeader && !startArticle && !targetArticle) {
        try {
          const [randomStart, randomTarget] = await Promise.all([
            getRandomWikipediaArticle(),
            getRandomWikipediaArticle()
          ]);
          setStartArticle(randomStart);
          setTargetArticle(randomTarget);
          await updateGame(gameCode, randomStart, randomTarget);
        } catch (error) {
          console.error("Failed to get random articles:", error);
        }
      }
    };

    initializeRandomArticles();
  }, [isLeader, gameCode]);

  const handleStartGame = async () => {
    if (!startArticle || !targetArticle) {
      alert("Please set both start and target articles");
      return;
    }

    try {
      await startGame(gameCode, startArticle, targetArticle);
      router.push(
        `/game?start=${startArticle}&target=${targetArticle}&code=${gameCode}`
      );
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

  const handleStartArticleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartArticle(value);
    setShowStartSuggestions(value.length > 0);
  };

  const handleTargetArticleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setTargetArticle(value);
    setShowTargetSuggestions(value.length > 0);
  };

  const handleStartArticleSelect = async (article: string) => {
    setStartArticle(article);
    setShowStartSuggestions(false);
    if (isLeader) {
      try {
        await updateGame(gameCode, article, targetArticle);
      } catch (error) {
        console.error("Failed to update game:", error);
      }
    }
  };

  const handleTargetArticleSelect = async (article: string) => {
    setTargetArticle(article);
    setShowTargetSuggestions(false);
    if (isLeader) {
      try {
        await updateGame(gameCode, startArticle, article);
      } catch (error) {
        console.error("Failed to update game:", error);
      }
    }
  };

  // Add these new handlers
  const handleRandomizeStart = async () => {
    if (!isLeader) return;
    try {
      const randomArticle = await getRandomWikipediaArticle();
      setStartArticle(randomArticle);
      await updateGame(gameCode, randomArticle, targetArticle);
    } catch (error) {
      console.error("Failed to get random start article:", error);
    }
  };

  const handleRandomizeTarget = async () => {
    if (!isLeader) return;
    try {
      const randomArticle = await getRandomWikipediaArticle();
      setTargetArticle(randomArticle);
      await updateGame(gameCode, startArticle, randomArticle);
    } catch (error) {
      console.error("Failed to get random target article:", error);
    }
  };

  const handleStartInputFocus = () => {
    if (isLeader) {
      setStartArticle("");
      setShowStartSuggestions(false);
    }
  };

  const handleTargetInputFocus = () => {
    if (isLeader) {
      setTargetArticle("");
      setShowTargetSuggestions(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Game Lobby</h2>
          <div className="mt-2 inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg">
            <span className="text-gray-600">Game Code:</span>
            <span className="ml-2 font-mono font-bold text-gray-900">{gameCode}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Game Settings */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Game Settings</h3>
            <div className="space-y-4">
              <div className="relative">
                <label htmlFor="start-article" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Article
                </label>
                <div className="flex gap-2">
                  <input
                    ref={startInputRef}
                    id="start-article"
                    type="text"
                    value={startArticle}
                    onChange={handleStartArticleChange}
                    onFocus={handleStartInputFocus}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Coffee"
                    disabled={!isLeader}
                  />
                  {isLeader && (
                    <button
                      onClick={handleRandomizeStart}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                      title="Get random article"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                      </svg>
                    </button>
                  )}
                </div>
                {showStartSuggestions &&
                  startSuggestions.length > 0 &&
                  isLeader && (
                    <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg">
                      {startSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.pageid}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            handleStartArticleSelect(suggestion.title)
                          }
                        >
                          {suggestion.title}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
              <div className="relative">
                <label htmlFor="target-article" className="block text-sm font-medium text-gray-700 mb-1">
                  Target Article
                </label>
                <div className="flex gap-2">
                  <input
                    ref={targetInputRef}
                    id="target-article"
                    type="text"
                    value={targetArticle}
                    onChange={handleTargetArticleChange}
                    onFocus={handleTargetInputFocus}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Moon"
                    disabled={!isLeader}
                  />
                  {isLeader && (
                    <button
                      onClick={handleRandomizeTarget}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
                      title="Get random article"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="20" 
                        height="20" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      >
                        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                        <path d="M21 3v5h-5"/>
                        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                        <path d="M8 16H3v5"/>
                      </svg>
                    </button>
                  )}
                </div>
                {showTargetSuggestions &&
                  targetSuggestions.length > 0 &&
                  isLeader && (
                    <div className="absolute z-10 w-full bg-white mt-1 rounded-md shadow-lg">
                      {targetSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.pageid}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() =>
                            handleTargetArticleSelect(suggestion.title)
                          }
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Players</h3>
            <div className="space-y-3">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <span className="text-gray-900 font-medium">{player.name}</span>
                  {player.isLeader && (
                    <span className="px-3 py-1 text-sm text-blue-600 bg-blue-100 rounded-full">
                      Leader
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            onClick={handleLeave}
            className="px-6 py-3 border border-red-300 rounded-lg text-red-700 hover:bg-red-50 transition-colors duration-200"
          >
            Leave Game
          </button>
          <button
            onClick={() => navigator.clipboard.writeText(gameCode)}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Copy Game Code
          </button>
          {isLeader && (
            <button
              onClick={handleStartGame}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
