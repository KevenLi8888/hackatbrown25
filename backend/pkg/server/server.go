package server

import (
	"github.com/gin-gonic/gin"
	"go.uber.org/zap/zapio"
	"wikirace/pkg/cfg"
	"wikirace/pkg/logger"
	"wikirace/pkg/logic/controller"
	"wikirace/pkg/middleware"
)

type Server struct {
	Config          cfg.Config
	router          *gin.Engine
	apiV1Controller *controller.APIV1
}

func New(config cfg.Config) *Server {
	return &Server{
		Config: config,
	}
}

// Start initializes the server and starts listening on the specified port
func (s *Server) Start() {
	logger.Infof("Starting server, env: %s, port: %s", s.Config.Server.Env, s.Config.Server.Port)
	// initialize gin engine
	logWriter := &zapio.Writer{Log: logger.Logger.Desugar()}
	gin.DefaultWriter = logWriter
	s.router = gin.Default()
	// add middleware
	s.router.Use(middleware.CORSMiddleware())
	// add handlers
	s.AddAPIHandlers()
	// start the server
	err := s.router.Run(":" + s.Config.Server.Port)
	if err != nil {
		logger.Errorf("Error starting server: %v", err)
	}
}

func (s *Server) Stop() error {
	return nil
}
