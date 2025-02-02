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

type StartGameRequest struct {
	GameCode      string `json:"gameCode"`
	StartArticle  string `json:"startArticle"`
	TargetArticle string `json:"targetArticle"`
}

type StartGameResponse struct {
	Game game.Game `json:"game"`
}

// StartGame implements /api/v1/games/start
func StartGame(app logic.Application, req StartGameRequest) (interface{}, error) {
	return game.StartGame(req.GameCode, req.StartArticle, req.TargetArticle, app.GetMongoDB())
}

type AddPathRequest struct {
	GameCode    string `json:"gameCode"`
	PlayerID    string `json:"playerID"`
	ArticleName string `json:"articleName"`
}

type AddPathResponse struct {
	Game game.Game `json:"game"`
}

// AddPath implements /api/v1/games/addpath
func AddPath(app logic.Application, req AddPathRequest) (interface{}, error) {
	return game.AddPath(req.GameCode, req.PlayerID, req.ArticleName, app.GetMongoDB())
}

type ResetGameRequest struct {
	GameCode string `json:"gameCode"`
}

type ResetGameResponse struct {
	Game game.Game `json:"game"`
}

// ResetGame implements /api/v1/games/reset
func ResetGame(app logic.Application, req ResetGameRequest) (interface{}, error) {
	return game.ResetGame(req.GameCode, app.GetMongoDB())
}
