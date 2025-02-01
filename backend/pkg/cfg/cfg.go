package cfg

import (
	"gopkg.in/yaml.v3"
	"os"
)

type Config struct {
	Server struct {
		Env  string `yaml:"env"` // "dev", "staging", "prod"
		Port string `yaml:"port"`
	} `yaml:"server"`
	Logger struct {
		Level string `yaml:"level"` // "debug", "info", "warn", "error", "dpanic", "panic", and "fatal"
	} `yaml:"logger"`
}

func ParseConfig(configPath string) (Config, error) {
	// Read the config file
	file, err := os.Open(configPath)
	if err != nil {
		return Config{}, err
	}
	// Parse the config file
	var cfg Config
	err = yaml.NewDecoder(file).Decode(&cfg)
	if err != nil {
		return Config{}, err
	}
	return cfg, nil
}
