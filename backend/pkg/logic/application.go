package logic

import (
	"go.mongodb.org/mongo-driver/mongo"
	"wikirace/pkg/cfg"
)

type Application interface {
	GetConfig() cfg.Config
	GetMongoDB() *mongo.Client
}
