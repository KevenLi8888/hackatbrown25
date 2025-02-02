// app/api/game/hint/route.ts (App Router) or pages/api/hint.ts (Pages Router)

import { NextResponse } from "next/server"; // or import type { NextApiRequest, NextApiResponse } if using Pages Router
import OpenAI from "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
// 1) Create an OpenAI instance with your API key
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Simple cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dot = vecA.reduce((acc, curr, i) => acc + curr * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, curr) => acc + curr * curr, 0));
  const normB = Math.sqrt(vecB.reduce((acc, curr) => acc + curr * curr, 0));
  return dot / (normA * normB);
}

// Helper to get embedding
async function getEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });

    // The embedding is in response.data[0].embedding
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error obtaining embedding:", error);
    throw new Error("Failed to get embedding");
  }
}

// If using the App Router (Next.js 13+):
export async function POST(req: Request) {
  try {
    const { links, target } = await req.json();

    if (!links?.length || !target) {
      return NextResponse.json({ error: "Missing links or target" }, { status: 400 });
    }

    const targetEmbedding = await getEmbedding(target);

    const similarities: { link: string; similarity: number }[] = [];
    for (const linkTitle of links) {
      const linkEmbedding = await getEmbedding(linkTitle);
      const similarity = cosineSimilarity(linkEmbedding, targetEmbedding);
      similarities.push({ link: linkTitle, similarity });
    }

    return NextResponse.json({ similarities }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
