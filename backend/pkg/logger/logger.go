package logger

import (
	"go.uber.org/zap/zapcore"
	"math/rand"
	"os"
	"path/filepath"
	"strconv"
	"sync"

	"go.uber.org/zap"
)

// https://betterstack.com/community/guides/logging/go/zap/#log-levels-in-zap

var (
	Logger *zap.SugaredLogger
	once   sync.Once

	LogLevelMap = map[string]zapcore.Level{
		"debug":  zapcore.DebugLevel,
		"info":   zapcore.InfoLevel,
		"warn":   zapcore.WarnLevel,
		"error":  zapcore.ErrorLevel,
		"dpanic": zapcore.DPanicLevel,
		"panic":  zapcore.PanicLevel,
		"fatal":  zapcore.FatalLevel,
	}
)

// Usage: import the package, then use the logger functions
// E.g., logger.Infof("Starting server on port %v\n", s.Port)

func InitGlobalLogger(logLevel string) {
	once.Do(func() {
		var err error
		logDir := "./tmp"
		// append a random number to the log file name so multiple instances will not log to the same file
		randNum := rand.Intn(1000)
		logFile := "logfile_" + strconv.Itoa(randNum) + ".log"

		// Ensure the directory exists
		if err := os.MkdirAll(logDir, os.ModePerm); err != nil {
			panic(err)
		}

		// create or append to the log file
		f, err := os.OpenFile(filepath.Join(logDir, logFile), os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
		if err != nil {
			panic(err)
		}
		f.Close()

		cfg := zap.NewDevelopmentConfig()
		if os.Getenv("ENV") == "prod" {
			cfg = zap.NewProductionConfig()
		}

		cfg.Level = zap.NewAtomicLevelAt(LogLevelMap[logLevel])
		cfg.DisableCaller = true
		cfg.OutputPaths = []string{"stdout", filepath.Join(logDir, logFile)}
		logger, err := cfg.Build()
		if err != nil {
			panic(err)
		}
		// use sugared logger
		Logger = logger.Sugar()
	})
}

// Debugf writes a debug log
func Debugf(template string, args ...interface{}) {
	Logger.Debugf(template, args...)
}

// Infof writes an info log
func Infof(template string, args ...interface{}) {
	Logger.Infof(template, args...)
}

// Warnf writes a warning log
func Warnf(template string, args ...interface{}) {
	Logger.Warnf(template, args...)
}

// Errorf writes an error log
func Errorf(template string, args ...interface{}) {
	Logger.Errorf(template, args...)
}

// Panicf writes a panic log
func Panicf(template string, args ...interface{}) {
	Logger.Panicf(template, args...)
}

// Fatalf writes a fatal log
func Fatalf(template string, args ...interface{}) {
	Logger.Fatalf(template, args...)
}
