package controller

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"wikirace/pkg/logger"
	"wikirace/pkg/stderror"
)

// Response is the response structure of the API
type Response struct {
	Code int         `json:"code"`
	Msg  string      `json:"msg"`
	Data interface{} `json:"data"`
}

func SendResponse(c *gin.Context, data interface{}, err error) {
	// intercept the error and log it
	if err != nil {
		logger.Warnf("error: %v", err.Error())
	}
	// return the standard error message instead of the original error message to frontend
	code, msg := stderror.StandardizeError(err)
	// always return http.StatusOK
	c.JSON(http.StatusOK, Response{
		Code: code,
		Msg:  msg,
		Data: data,
	})
}
