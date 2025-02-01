package main

import (
	"log"
	"os"
	"wikirace/pkg/cfg"
	"wikirace/pkg/logger"
	"wikirace/pkg/server"
)

func main() {
	// parse command line arguments
	// usage: wikirace-backend --config <file path>

	if len(os.Args) != 3 {
		log.Fatalf("usage: %s --config <file path>", os.Args[0])
	} else if os.Args[1] != "--config" {
		log.Fatalf("usage: %s --config <file path>", os.Args[0])
	}

	// parse the config
	config, err := cfg.ParseConfig(os.Args[2])
	if err != nil {
		log.Fatalf("parse config file failed: %v", err)
	}

	// initialize global logger
	logger.InitGlobalLogger(config.Logger.Level)

	// create and start the server
	server.New(config).Start()
}
