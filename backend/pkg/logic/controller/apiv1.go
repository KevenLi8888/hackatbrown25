package controller

import (
	"errors"
	"github.com/gin-gonic/gin"
	"wikirace/pkg/logic"
	"wikirace/pkg/logic/api/apiv1"
	"wikirace/pkg/stderror"
)

type APIV1 struct {
	app logic.Application
}

// NewAPIV1 creates an APIV1 controller
func NewAPIV1(app logic.Application) *APIV1 {
	return &APIV1{
		app: app,
	}
}

func (a *APIV1) HealthCheck(ctx *gin.Context) {
	data, err := apiv1.HealthCheck()
	if err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrInternal, err))
		return
	}
	SendResponse(ctx, data, nil)
}

// CreateGame implements /api/v1/games/create
func (a *APIV1) CreateGame(ctx *gin.Context) {
	var req apiv1.CreateGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.CreateGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrInternal, err))
	}
	SendResponse(ctx, data, nil)
}

// JoinGame implements /api/v1/games/join
func (a *APIV1) JoinGame(ctx *gin.Context) {
	var req apiv1.JoinGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.JoinGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// GetGame implements /api/v1/games/info
func (a *APIV1) GetGame(ctx *gin.Context) {
	gameCode := ctx.Query("gameCode")
	if gameCode == "" {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBadRequest, errors.New("gameCode is required")))
		return
	}
	data, err := apiv1.GetGame(a.app, gameCode)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// StartGame implements /api/v1/games/start
func (a *APIV1) StartGame(ctx *gin.Context) {
	var req apiv1.StartGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.StartGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// AddPath implements /api/v1/games/addpath
func (a *APIV1) AddPath(ctx *gin.Context) {
	var req apiv1.AddPathRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.AddPath(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// ResetGame implements /api/v1/games/reset
func (a *APIV1) ResetGame(ctx *gin.Context) {
	var req apiv1.ResetGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.ResetGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// UpdateGame implements /api/v1/games/update
func (a *APIV1) UpdateGame(ctx *gin.Context) {
	var req apiv1.UpdateGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.UpdateGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}

// LeaveGame implements /api/v1/games/leave
func (a *APIV1) LeaveGame(ctx *gin.Context) {
	var req apiv1.LeaveGameRequest
	if err := ctx.Bind(&req); err != nil {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBind, err))
		return
	}
	data, err := apiv1.LeaveGame(a.app, req)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}
