package logic

import "wikirace/pkg/cfg"

type Application interface {
	GetConfig() cfg.Config
}
