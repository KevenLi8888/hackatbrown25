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
