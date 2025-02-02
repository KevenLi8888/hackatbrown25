package server

import (
	"go.mongodb.org/mongo-driver/mongo"
	"wikirace/pkg/cfg"
	"wikirace/pkg/logic/controller"
)

func (s *Server) AddAPIHandlers() {

	// API v1
	v1 := s.router.Group("/api/v1")
	{
		s.apiV1Controller = controller.NewAPIV1(s)
		v1.GET("/ping", s.apiV1Controller.HealthCheck)

		// games API
		v1.POST("/games/create", s.apiV1Controller.CreateGame)
		v1.POST("/games/join", s.apiV1Controller.JoinGame)
		v1.GET("/games/info", s.apiV1Controller.GetGame)
	}
}

func (s *Server) GetConfig() cfg.Config {
	return s.Config
}

func (s *Server) GetMongoDB() *mongo.Client {
	return s.MongoDB
}
