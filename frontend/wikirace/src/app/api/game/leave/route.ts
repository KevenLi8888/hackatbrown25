import { NextResponse } from "next/server";
import { games } from "../route";

export async function POST(request: Request) {
  const { code, playerId } = await request.json();

  if (!games.has(code)) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const game = games.get(code)!;
  const leavingPlayer = game.players.find(p => p.id === playerId);

  if (leavingPlayer?.isLeader) {
    // If leader leaves, delete the game
    games.delete(code);
    return NextResponse.json({ status: "game_closed" });
  } else {
    // Remove the player from the game
    game.players = game.players.filter(p => p.id !== playerId);
    games.set(code, game);
    return NextResponse.json(game);
  }
} 