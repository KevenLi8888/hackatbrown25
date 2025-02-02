import { Game } from '@/types/game';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface HintResponse {
  data: Array<{ link: string; similarity: number }>;
}

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
  const response = await fetch(`${API_BASE_URL}/api/v1/games/start`, {
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
    console.error('Start game failed:', await response.text());
    throw new Error('Failed to start game');
  }

  const data = await response.json();
  return data.data;
}

export async function leaveGame(gameCode: string, playerId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/leave`, {
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

export async function getHint(links: string[], target: string): Promise<HintResponse> {
  const response = await fetch(`/api/game/hint`, {
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
    console.error('Get hint failed:', await response.text());
    throw new Error('Failed to get hint');
  }

  const data = await response.json();
  return {
    data: data.similarities
  };
}

export async function addPath(gameCode: string, playerId: string, articleName: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/addpath`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameCode,
      playerID: playerId,
      articleName,
    }),
  });

  if (!response.ok) {
    console.error('Add path failed:', await response.text());
    throw new Error('Failed to add path');
  }

  const data = await response.json();
  return data.data;
}

export async function resetGame(gameCode: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/reset`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameCode,
    }),
  });

  if (!response.ok) {
    console.error('Reset game failed:', await response.text());
    throw new Error('Failed to reset game');
  }

  const data = await response.json();
  return data.data;
}

export async function updateGame(gameCode: string, startArticle: string, targetArticle: string): Promise<Game> {
  const response = await fetch(`${API_BASE_URL}/api/v1/games/update`, {
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
    console.error('Update game failed:', await response.text());
    throw new Error('Failed to update game');
  }

  const data = await response.json();
  return data.data;
} 