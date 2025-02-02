package game

import (
	"errors"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
	"wikirace/pkg/helper"
	"wikirace/pkg/logger"
	"wikirace/pkg/mongodb"
	"wikirace/pkg/stderror"
)

type Game struct {
	Code          string    `json:"code"`
	Players       []Player  `json:"players"`
	State         string    `json:"state"`
	StartArticle  string    `json:"startArticle"`
	TargetArticle string    `json:"targetArticle"`
	StartTime     time.Time `json:"startTime"`
	EndTime       time.Time `json:"endTime"`
}

type Player struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	IsLeader bool     `json:"isLeader"`
	IsWinner bool     `json:"isWinner"`
	Paths    []string `json:"paths"`
}

// CreateGame stores a new game to the database
func CreateGame(leaderName, playerID string, db *mongo.Client) (*Game, error) {
	leader := Player{
		ID:       playerID,
		Name:     leaderName,
		IsLeader: true,
	}
	code, err := helper.GenerateRandomCode(6)
	// TODO: check if code already exists
	if err != nil {
		return nil, err
	}
	game := Game{
		Code: code,
		Players: []Player{
			leader,
		},
		State:         "waiting",
		StartArticle:  "",
		TargetArticle: "",
	}

	// save the game to the database
	collection := mongodb.GetCollection(db, "wikirace", "games")
	_, err = collection.InsertOne(nil, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// JoinGame adds a player to a game and updates the database
func JoinGame(gameCode, playerID, playerName string, db *mongo.Client) (*Game, error) {
	// get the game from the database
	collection := mongodb.GetCollection(db, "wikirace", "games")
	filter := map[string]string{
		"code": gameCode,
	}
	game := Game{}
	err := collection.FindOne(nil, filter).Decode(&game)
	// TODO: return a more user-friendly error message (Game not found)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			logger.Debugf("game not found: %v", gameCode)
			return nil, stderror.New(stderror.ErrGameNotFound, errors.New("game not found, code: "+gameCode))
		}
		return nil, err
	}

	// add the player to the game
	player := Player{
		ID:       playerID,
		Name:     playerName,
		IsLeader: false,
	}
	game.Players = append(game.Players, player)

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// GetGame returns a game from the database
func GetGame(gameCode string, db *mongo.Client) (*Game, error) {
	// get the game from the database
	collection := mongodb.GetCollection(db, "wikirace", "games")
	filter := map[string]string{
		"code": gameCode,
	}
	game := Game{}
	err := collection.FindOne(nil, filter).Decode(&game)
	if err != nil {
		if errors.Is(err, mongo.ErrNoDocuments) {
			logger.Debugf("game not found: %v", gameCode)
			return nil, stderror.New(stderror.ErrGameNotFound, errors.New("game not found, code: "+gameCode))
		}
		return nil, err
	}
	return &game, nil
}
