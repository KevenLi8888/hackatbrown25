import { NextResponse } from "next/server";
import OpenAI from "openai";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

function cleanJsonResponse(content: string): string {
    // Remove markdown code block syntax if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }
    return content.trim();
}

export async function POST(req: Request) {
  try {
    const { links, currentArticle, target } = await req.json();

    if (!links?.length || !target || !currentArticle) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const prompt = `You are helping in a Wikipedia racing game. The player needs to get from the article "${currentArticle}" to "${target}". 
    Here are some links available on the current page: ${links.join(", ")}
    
    Analyze these links and suggest up to 5 that are most likely to help reach the target article. For each suggestion, provide short and brief reasoning.
    
    Format your response as JSON like this:
    {
      "suggestions": [
        {
          "link": "link title",
          "reasoning": "brief explanation"
        }
      ]
    }`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    const content = response.choices[0].message.content;
    const cleanedContent = cleanJsonResponse(content || "{}");
    const suggestions = JSON.parse(cleanedContent);

    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    console.error('Error processing GPT hint:', error);
    return NextResponse.json({ error: 'Failed to generate hints' }, { status: 500 });
  }
} 