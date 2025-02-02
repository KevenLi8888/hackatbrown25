"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWikipediaArticle } from "@/utils/wikipedia";
import { getGameInfo, getHint, addPath } from "@/services/gameService";
import type { Game } from "@/types/game";

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
        setGame(gameData);

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
    const interval = setInterval(fetchGameInfo, 5000);
    return () => clearInterval(interval);
  }, [gameCode, router]);

  // Load Wikipedia's CSS once
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://en.wikipedia.org/w/load.php?modules=mediawiki.legacy.commonPrint,shared|mediawiki.skinning.elements|mediawiki.skinning.content|mediawiki.skinning.interface|skins.vector.styles|site|mediawiki.skinning.content.parsoid|ext.cite.style|ext.kartographer.style&only=styles&skin=vector";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Add this style to the head of the document
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .hinted-link-red { color: red !important; font-weight: bold !important; }
      .hinted-link-green { color: green !important; font-weight: bold !important; }
      .hinted-link-orange { color: orange !important; font-weight: bold !important; }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
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
          let colorClass = "hinted-link-red";
          if (similarity > 0.75) colorClass = "hinted-link-green";
          else if (similarity > 0.5) colorClass = "hinted-link-orange";

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
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Game Info Panel */}
        <div className="md:col-span-1 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Game Info</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Player:</span> {playerName}
            </p>
            <p>
              <span className="font-semibold">Target:</span> {targetArticle}
            </p>
            <p>
              <span className="font-semibold">Clicks:</span> {clicks}
            </p>
            <p>
              <span className="font-semibold">Current:</span> {currentArticle}
            </p>
          </div>
          <div className="mt-4">
            <button
              onClick={handleHintClick}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Hint
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {hintedLinks.map((link) => (
              <div key={link.href} className="flex flex-col gap-1">
                <span>{link.title}</span>
                <span>Similarity: {link.similarity.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wikipedia Article */}
        <div className="md:col-span-3 bg-white shadow p-4 rounded-lg">
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
