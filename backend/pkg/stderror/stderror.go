package stderror

var (
	// common errors
	OK                = &StdError{Code: 0, Message: "OK"}
	ErrInternal       = &StdError{Code: 10001, Message: "Internal server error."}
	ErrServerBusy     = &StdError{Code: 10002, Message: "Server is busy."}
	ErrBadRequest     = &StdError{Code: 10003, Message: "Bad request."}
	ErrBadSignature   = &StdError{Code: 10004, Message: "Bad signature."}
	ErrBind           = &StdError{Code: 10005, Message: "Request binding error."}
	ErrValidation     = &StdError{Code: 10006, Message: "Validation failed."}
	ErrDatabase       = &StdError{Code: 10007, Message: "Database error."}
	ErrAPI            = &StdError{Code: 10008, Message: "API error."}
	ErrGameNotFound   = &StdError{Code: 10009, Message: "Game not found."}
	ErrPlayerNotFound = &StdError{Code: 10010, Message: "Player not found."}
)

type StdError struct {
	Code    int
	Message string
}

type WrappedError struct {
	StdError
	RealError error
}

func (e *WrappedError) Error() string {
	return e.RealError.Error()
}

func (e *StdError) Error() string {
	return e.Message
}

// StandardizeError transforms an error to a standard error (hiding the actual error)
// thus it can be used in the response to the frontend
func StandardizeError(err error) (int, string) {
	if err == nil {
		return OK.Code, OK.Message
	}

	switch typed := err.(type) {
	case *WrappedError:
		return typed.Code, typed.Message
	case *StdError:
		return typed.Code, typed.Message
	default:
		return ErrInternal.Code, ErrInternal.Message
	}
}

func New(stdError *StdError, realError error) *WrappedError {
	return &WrappedError{StdError: *stdError, RealError: realError}
}
