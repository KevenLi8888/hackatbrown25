package server

import (
	"wikirace/pkg/cfg"
	"wikirace/pkg/logic/controller"
)

func (s *Server) AddAPIHandlers() {

	// API v1
	v1 := s.router.Group("/api/v1")
	{
		s.apiV1Controller = controller.NewAPIV1(s)
		v1.GET("/ping", s.apiV1Controller.HealthCheck)
	}
}

func (s *Server) GetConfig() cfg.Config {
	return s.Config
}
