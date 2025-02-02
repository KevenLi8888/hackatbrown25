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

const (
	expirationTime = 4 * time.Hour
)

type Game struct {
	Code          string    `json:"code"`
	Players       []Player  `json:"players"`
	State         string    `json:"state"`
	StartArticle  string    `json:"startArticle"`
	TargetArticle string    `json:"targetArticle"`
	StartTime     time.Time `json:"startTime"`
	EndTime       time.Time `json:"endTime"`
	ExpiresAfter  time.Time `json:"expiresAfter"`
}

type Player struct {
	ID       string   `json:"id"`
	Name     string   `json:"name"`
	IsLeader bool     `json:"isLeader"`
	IsWinner bool     `json:"isWinner"`
	Paths    []string `json:"paths"` // list of article names
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
		ExpiresAfter:  time.Now().Add(expirationTime),
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
	game.ExpiresAfter = time.Now().Add(expirationTime)

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

// StartGame starts a game
func StartGame(gameCode string, startArticle string, targetArticle string, db *mongo.Client) (*Game, error) {
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

	// update the game state
	game.State = "playing"
	game.StartArticle = startArticle
	game.TargetArticle = targetArticle
	game.StartTime = time.Now()
	game.ExpiresAfter = time.Now().Add(expirationTime)

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// AddPath adds a path to a game and updates the game status accordingly
func AddPath(gameCode, playerID, path string, db *mongo.Client) (*Game, error) {
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

	// if game already finished, return the game
	if game.State == "finished" {
		return &game, nil
	}

	// add the path to the player
	playerFound := false
	for i, p := range game.Players {
		if p.ID == playerID {
			game.Players[i].Paths = append(game.Players[i].Paths, path)
			playerFound = true
			// check if the player has reached the target article
			if path == game.TargetArticle {
				game.State = "finished"
				game.EndTime = time.Now()
				game.Players[i].IsWinner = true
			}
			break
		}
	}
	if !playerFound {
		return nil, stderror.New(stderror.ErrPlayerNotFound, errors.New("player not found, id: "+playerID))
	}
	game.ExpiresAfter = time.Now().Add(expirationTime)

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// ResetGame resets a game to the initial state
func ResetGame(gameCode string, db *mongo.Client) (*Game, error) {
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

	// reset the game
	game.State = "waiting"
	game.StartArticle = ""
	game.TargetArticle = ""
	game.StartTime = time.Time{}
	game.EndTime = time.Time{}
	game.ExpiresAfter = time.Now().Add(expirationTime)
	for i := range game.Players {
		game.Players[i].Paths = []string{}
		game.Players[i].IsWinner = false
	}

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// UpdateGame updates the start and target articles of a game
func UpdateGame(gameCode, startArticle, targetArticle string, db *mongo.Client) (*Game, error) {
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

	// update the game
	game.StartArticle = startArticle
	game.TargetArticle = targetArticle
	game.ExpiresAfter = time.Now().Add(expirationTime)

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}

// LeaveGame removes a player from a game
func LeaveGame(gameCode, playerID string, db *mongo.Client) (*Game, error) {
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

	// remove the player from the game
	playerFound := false
	for i, p := range game.Players {
		if p.ID == playerID {
			game.Players = append(game.Players[:i], game.Players[i+1:]...)
			playerFound = true
			break
		}
	}
	if !playerFound {
		return nil, stderror.New(stderror.ErrPlayerNotFound, errors.New("player not found, id: "+playerID))
	}
	game.ExpiresAfter = time.Now().Add(expirationTime)

	// update the game in the database
	_, err = collection.ReplaceOne(nil, filter, game)
	if err != nil {
		return nil, err
	}
	return &game, nil
}
