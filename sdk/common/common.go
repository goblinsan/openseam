// Package common provides shared types and utilities for the OpenSeam SDK.
package common

// Config holds provider configuration loaded from manifests or environment variables.
type Config struct {
	Provider string            `yaml:"provider" json:"provider"`
	Region   string            `yaml:"region"   json:"region"`
	Options  map[string]string `yaml:"options"  json:"options"`
}

// AdapterFactory creates adapter instances based on provider configuration.
type AdapterFactory interface {
	// NewStorage creates a storage adapter for the configured provider.
	NewStorage(cfg Config) (interface{}, error)

	// NewMessaging creates a messaging adapter for the configured provider.
	NewMessaging(cfg Config) (interface{}, error)
}
