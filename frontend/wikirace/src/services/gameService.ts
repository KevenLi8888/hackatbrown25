import { Game } from '@/types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function createGame(leaderName: string, playerId: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      LeaderName: leaderName,
      PlayerID: playerId,
    }),
  });

  if (!response.ok) {
    console.error('Create game failed:', await response.text());
    throw new Error('Failed to create game');
  }

  const data = await response.json();
  return data.data;
}

export async function joinGame(playerName: string, playerId: string, gameCode: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameCode: gameCode,
      playerID: playerId,
      playerName: playerName,
    }),
  });

  if (!response.ok) {
    console.error('Join game failed:', await response.text());
    throw new Error('Failed to join game');
  }

  const data = await response.json();
  return data.data;
}

export async function getGameInfo(gameCode: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/info?gameCode=${gameCode}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get game info');
  }

  const data = await response.json();
  return data.data;
}

export async function startGame(gameCode: string, startArticle: string, targetArticle: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/game/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameCode,
      startArticle,
      targetArticle,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to start game');
  }

  const data = await response.json();
  return data.data;
}

export async function leaveGame(gameCode: string, playerId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/game/leave`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameCode,
      playerID: playerId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to leave game');
  }
}

export async function getHint(links: string[], target: string): Promise<{ similarities: Array<{ link: string, similarity: number }> }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/game/hint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      links,
      target,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get hint');
  }

  return response.json();
} 