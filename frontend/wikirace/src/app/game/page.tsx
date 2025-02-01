"use client";
import { useState, useEffect } from "react";
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
  const [currentArticle, setCurrentArticle] = useState(
    searchParams.get("start") || ""
  );
  const [targetArticle] = useState(searchParams.get("target") || "");
  const [gameCode] = useState(searchParams.get("code") || "");
  const [clicks, setClicks] = useState(0);
  const [content, setContent] = useState<WikipediaContent | null>(null);
  const [loading, setLoading] = useState(true);

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
          router.push("/");
        }
      }
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
              <span className="font-semibold">Target:</span> {targetArticle}
            </p>
            <p>
              <span className="font-semibold">Clicks:</span> {clicks}
            </p>
            <p>
              <span className="font-semibold">Current:</span> {currentArticle}
            </p>
          </div>
        </div>

        {/* Wikipedia Article */}
        <div className="md:col-span-3 bg-white p-4 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">{content?.title}</h1>
          <div
            className="prose max-w-none"
            onClick={handleLinkClick}
            dangerouslySetInnerHTML={{ __html: content?.text["*"] || "" }}
          />
        </div>
      </div>
    </div>
  );
}
