export interface Player {
  id: string;
  name: string;
  isLeader: boolean;
  isWinner: boolean;
  paths: string[];
}

export interface Game {
  code: string;
  players: Player[];
  state: 'waiting' | 'playing' | 'finished';
  startArticle: string;
  targetArticle: string;
  startTime?: string;
  endTime?: string;
}

export interface CreateGameRequest {
  leaderName: string;
  playerID: string;
}

export interface JoinGameRequest {
  playerName: string;
  playerID: string;
  gameCode: string;
}

export interface GameResponse {
  game: Game;
} 