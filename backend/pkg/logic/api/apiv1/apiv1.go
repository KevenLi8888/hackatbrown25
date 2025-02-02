package apiv1

import (
	"wikirace/pkg/game"
	"wikirace/pkg/logic"
)

// HealthCheck implements /api/v1/ping
func HealthCheck() (interface{}, error) {
	return "pong", nil
}

type CreateGameRequest struct {
	LeaderName string `json:"leaderName"`
	PlayerID   string `json:"playerID"`
}

type CreateGameResponse struct {
	Game game.Game `json:"game"`
}

// CreateGame implements /api/v1/games/create
func CreateGame(app logic.Application, req CreateGameRequest) (interface{}, error) {
	return game.CreateGame(req.LeaderName, req.PlayerID, app.GetMongoDB())
}

type JoinGameRequest struct {
	GameCode   string `json:"gameCode"`
	PlayerID   string `json:"playerID"`
	PlayerName string `json:"playerName"`
}

type JoinGameResponse struct {
	Game game.Game `json:"game"`
}

// JoinGame implements /api/v1/games/join
func JoinGame(app logic.Application, req JoinGameRequest) (interface{}, error) {
	return game.JoinGame(req.GameCode, req.PlayerID, req.PlayerName, app.GetMongoDB())
}

// GetGame implements /api/v1/games/info
func GetGame(app logic.Application, gameCode string) (interface{}, error) {
	return game.GetGame(gameCode, app.GetMongoDB())
}
