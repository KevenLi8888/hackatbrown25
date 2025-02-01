"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWikipediaArticle } from "@/utils/wikipedia";

interface WikipediaContent {
  title: string;
  text: { "*": string };
  links: { "*": string }[];
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

  const articleContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadArticle = async () => {
      setLoading(true);
      try {
        const data = await getWikipediaArticle(currentArticle);
        setContent(data);
      } catch (error) {
        console.error("Failed to load article:", error);
      }
      setLoading(false);
    };

    if (currentArticle) {
      loadArticle();
    }
  }, [currentArticle]);

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

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
          router.push("/");
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

    const firstTenLinks = links.slice(0, 5);
    const linkTitles = firstTenLinks.map((link) =>
      decodeURIComponent(link.getAttribute("href")!.split("/wiki/")[1])
    );

    try {
      const response = await fetch("/api/game/hint", {
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

      similarities.forEach(({ link, similarity }: any) => {
        const matchingLink = firstTenLinks.find((l) =>
          l
            .getAttribute("href")
            ?.endsWith(encodeURIComponent(link))
        );
        if (matchingLink) {
          let color = "red";
          if (similarity > 0.75) color = "green";
          else if (similarity > 0.5) color = "orange";

          matchingLink.style.color = color;
          matchingLink.style.fontWeight = "bold";
          matchingLink.title = `Similarity to target: ${similarity.toFixed(2)}`;
        }
      });
    } catch (error) {
      console.error("Error retrieving hint:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading article...</div>
      </div>
    );
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
