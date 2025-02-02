"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWikipediaArticle } from "@/utils/wikipedia";
import {
  getGameInfo,
  resetGame,
  addPath,
  leaveGame,
} from "@/services/gameService";
import type { Game } from "@/types/game";
import styles from './game.module.css';

interface WikipediaContent {
  title: string;
  text: { "*": string };
  links: { "*": string }[];
}

interface HintedLink {
  href: string;
  color: string;
  similarity: number;
  title: string;
}

function normalizeWikiLink(url: string): string {
  // Remove /wiki/ prefix and decode URI components
  const link = url.split("/wiki/")[1] || "";
  return decodeURIComponent(link).replace(/_/g, " ");
}

export default function Game() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [playerName] = useState(
    () => localStorage.getItem("playerName") || "Anonymous"
  );
  const [currentArticle, setCurrentArticle] = useState(
    searchParams.get("start") || ""
  );
  const [targetArticle] = useState(searchParams.get("target") || "");
  const [gameCode] = useState(searchParams.get("code") || "");
  const [clicks, setClicks] = useState(0);
  const [content, setContent] = useState<WikipediaContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState("");
  const [hintedLinks, setHintedLinks] = useState<HintedLink[]>([]);

  const articleContainerRef = useRef<HTMLDivElement>(null);

  const handleReset = async () => {
    try {
      await resetGame(gameCode);
    } catch (error) {
      console.error("Failed to reset game:", error);
      setError("Failed to reset game");
    }
  };

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const data = await getWikipediaArticle(currentArticle);
        setContent(data);
        if (game?.state === "playing") {
          await addPath(
            gameCode,
            localStorage.getItem("playerId") || "",
            currentArticle
          );
        }
      } catch (error) {
        console.error("Failed to load article:", error);
        setError("Failed to load article");
      }
      setLoading(false);
    };

    if (currentArticle) {
      loadArticle();
    }
  }, [currentArticle, game?.state, gameCode]);

  useEffect(() => {
    const fetchGameInfo = async () => {
      if (!gameCode) {
        setError("No game code provided");
        return;
      }

      try {
        const gameData = await getGameInfo(gameCode);
        
        // Only update if the state has changed
        setGame(prevGame => {
          if (JSON.stringify(prevGame) === JSON.stringify(gameData)) {
            return prevGame;
          }
          return gameData;
        });

        if (gameData.state === "finished") {
          router.push(`/stats?code=${gameCode}`);
        } else if (gameData.state === "waiting") {
          router.push(`/lobby?code=${gameCode}`);
        }
      } catch (err) {
        setError("Failed to fetch game info");
      }
    };

    fetchGameInfo();
    const interval = setInterval(fetchGameInfo, 1000);
    return () => clearInterval(interval);
  }, [gameCode, router]);

  // Update the Wikipedia CSS loading effect to include more style modules
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://en.wikipedia.org/w/load.php?modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.elements|mediawiki.skinning.content|mediawiki.skinning.interface|skins.vector.styles|site|mediawiki.skinning.content.parsoid|ext.cite.style|ext.kartographer.style|mediawiki.page.gallery.styles|ext.visualEditor.desktopArticleTarget.noscript|ext.tmh.thumbnail.styles|ext.uls.interlanguage|ext.wikimediaBadges|ext.3d.styles&only=styles&skin=vector";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLinkClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.tagName === "A" &&
      target.getAttribute("href")?.startsWith("/wiki/")
    ) {
      e.preventDefault();
      const articleTitle = target.getAttribute("href")?.split("/wiki/")[1];
      if (articleTitle) {
        setClicks((prev) => prev + 1);
        setCurrentArticle(decodeURIComponent(articleTitle));

        if (articleTitle === targetArticle) {
          alert(`You won in ${clicks + 1} clicks!`);
        }
      }
    }
  };

  const handleHintClick = async () => {
    if (!articleContainerRef.current) return;

    const links = Array.from(
      articleContainerRef.current.querySelectorAll("a[href^='/wiki/']")
    ) as HTMLAnchorElement[];
    if (links.length === 0) return;

    // Only get hints for links that haven't been hinted yet
    const hintedHrefs = new Set(
      hintedLinks.map((link) => normalizeWikiLink(link.href))
    );
    const firstTenLinks = links
      .filter(
        (link) =>
          !hintedHrefs.has(normalizeWikiLink(link.getAttribute("href") || ""))
      )
      .slice(0, 5);

    const linkTitles = firstTenLinks.map((link) =>
      normalizeWikiLink(link.getAttribute("href") || "")
    );

    if (linkTitles.length === 0) return;

    try {
      const response = await fetch("/game/hints", {
        method: "POST",
        body: JSON.stringify({
          links: linkTitles,
          target: targetArticle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get hint from API");
      }

      const data = await response.json();
      const { similarities } = data;

      const newHintedLinks: HintedLink[] = [];

      similarities.forEach(({ link, similarity }: any) => {
        const matchingLink = firstTenLinks.find(
          (l) => normalizeWikiLink(l.getAttribute("href") || "") === link
        );
        if (matchingLink) {
          let colorClass = styles.hintedLinkRed;
          if (similarity > 0.75) colorClass = styles.hintedLinkGreen;
          else if (similarity > 0.5) colorClass = styles.hintedLinkOrange;

          newHintedLinks.push({
            href: matchingLink.getAttribute("href") || "",
            color: colorClass,
            similarity,
            title: normalizeWikiLink(matchingLink.getAttribute("href") || ""),
          });

          matchingLink.className = `${matchingLink.className} ${colorClass}`;
          matchingLink.title = `Similarity to target: ${similarity.toFixed(2)}`;
        }
      });

      setHintedLinks(newHintedLinks);
    } catch (error) {
      console.error("Error retrieving hint:", error);
    }
  };

  useEffect(() => {
    if (!articleContainerRef.current || !content) return;

    hintedLinks.forEach(({ href, color, similarity }) => {
      const link = articleContainerRef.current?.querySelector(
        `a[href="${href}"]`
      ) as HTMLAnchorElement;
      if (link) {
        link.className = `${link.className} ${color}`;
        link.title = `Similarity to target: ${similarity.toFixed(2)}`;
      }
    });
  }, [content, hintedLinks]);


  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Game Info Panel */}
      <div className="md:col-span-1">
        <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4 max-h-[calc(100vh-2rem)] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <span className="material-icons-outlined">sports_esports</span>
            Game Info
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-600 mb-1 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">person</span>
                Player
              </p>
              <p className="font-semibold text-gray-800">{playerName}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-purple-600 mb-1 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">flag</span>
                Target
              </p>
              <p className="font-semibold text-gray-800">{targetArticle}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-600 mb-1 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">touch_app</span>
                Clicks
              </p>
              <p className="font-semibold text-gray-800">{clicks}</p>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-600 mb-1 flex items-center gap-1">
                <span className="material-icons-outlined text-sm">article</span>
                Current Article
              </p>
              <p className="font-semibold text-gray-800">{currentArticle}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={handleHintClick}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="material-icons-outlined">lightbulb</span>
              Get Hint
            </button>
            <button
              onClick={handleReset}
              className="w-full py-3 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <span className="material-icons-outlined">refresh</span>
              Give Up
            </button>
          </div>

          {hintedLinks.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
                <span className="material-icons-outlined">tips_and_updates</span>
                Hints
              </h3>
              <div className="space-y-3">
                {hintedLinks.map((link) => (
                  <div 
                    key={link.href} 
                    className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200"
                  >
                    <p className="font-medium text-gray-800 break-words">{link.title}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div 
                        className={`h-2.5 flex-grow rounded-full bg-gray-200`}
                      >
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            link.similarity > 0.75 
                              ? 'bg-gradient-to-r from-green-400 to-green-500' 
                              : link.similarity > 0.5 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' 
                              : 'bg-gradient-to-r from-red-400 to-red-500'
                          }`}
                          style={{ width: `${link.similarity * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                        {(link.similarity * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wikipedia Article */}
      <div className="md:col-span-3">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {content && (
            <h1 className="text-3xl font-bold mb-6 text-gray-800">{content.title}</h1>
          )}
          <div
            id="mw-content-text"
            ref={articleContainerRef}
            className="mw-body mw-body-content prose max-w-none"
            onClick={handleLinkClick}
            dangerouslySetInnerHTML={{ __html: content?.text["*"] || "" }}
          />
        </div>
      </div>
    </div>
  );
}
