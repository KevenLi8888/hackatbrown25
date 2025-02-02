import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dot = vecA.reduce((acc, curr, i) => acc + curr * vecB[i], 0);
  const normA = Math.sqrt(vecA.reduce((acc, curr) => acc + curr * curr, 0));
  const normB = Math.sqrt(vecB.reduce((acc, curr) => acc + curr * curr, 0));
  return dot / (normA * normB);
}

async function getEmbedding(text: string) {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error obtaining embedding:", error);
    throw new Error("Failed to get embedding");
  }
}

export async function POST(req: Request) {
  try {
    const { links, target } = await req.json();

    if (!links?.length || !target) {
      return NextResponse.json(
        { error: "Missing links or target" },
        { status: 400 }
      );
    }

    const targetEmbedding = await getEmbedding(target);

    const similarities = await Promise.all(
      links.map(async (linkTitle: string) => {
        const linkEmbedding = await getEmbedding(linkTitle);
        const similarity = cosineSimilarity(linkEmbedding, targetEmbedding);
        return { link: linkTitle, similarity };
      })
    );

    return NextResponse.json({ similarities }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
} 