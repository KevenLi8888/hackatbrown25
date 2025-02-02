package controller

import (
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

func (a *APIV1) GetGame(ctx *gin.Context) {
	gameCode := ctx.Query("gameCode")
	if gameCode == "" {
		SendResponse(ctx, nil, stderror.New(stderror.ErrBadRequest, nil))
		return
	}
	data, err := apiv1.GetGame(a.app, gameCode)
	if err != nil {
		SendResponse(ctx, nil, err)
		return
	}
	SendResponse(ctx, data, nil)
}
