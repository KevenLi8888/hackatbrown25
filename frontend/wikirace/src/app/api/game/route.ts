import { NextResponse } from "next/server";

interface Game {
  code: string;
  startArticle: string;
  targetArticle: string;
  players: Player[];
  status: "waiting" | "playing" | "finished";
}

interface Player {
  id: string;
  name: string;
  isLeader: boolean;
}

// Export games Map so it can be accessed by the leave route
export const games = new Map<string, Game>();

export async function POST(request: Request) {
  const { code, player } = await request.json();

  // Create new game if it doesn't exist
  if (!games.has(code)) {
    games.set(code, {
      code,
      startArticle: "",
      targetArticle: "",
      players: [{ ...player, isLeader: true }],
      status: "waiting",
    });
  } else {
    // Add player to existing game if they're not already in it
    const game = games.get(code)!;
    const existingPlayer = game.players.find(p => p.id === player.id);
    
    if (!existingPlayer) {
      game.players.push({ ...player, isLeader: false });
      games.set(code, game);
    }
  }

  return NextResponse.json(games.get(code));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || !games.has(code)) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(games.get(code));
}

export async function PUT(request: Request) {
  const { code, startArticle, targetArticle, status } = await request.json();
  
  if (!games.has(code)) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const game = games.get(code)!;
  games.set(code, {
    ...game,
    startArticle,
    targetArticle,
    status,
  });

  return NextResponse.json(games.get(code));
} 