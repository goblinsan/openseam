// Package parser reads and validates OpenSeam architecture manifests.
package parser

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

// Manifest represents an OpenSeam architecture manifest.
type Manifest struct {
	Application  string                     `yaml:"application"`
	Portability  map[string]string          `yaml:"portability"`
	Providers    map[string]ProviderConfig   `yaml:"providers"`
}

// ProviderConfig holds provider-specific service mappings.
type ProviderConfig struct {
	Storage   string `yaml:"storage"`
	Messaging string `yaml:"messaging"`
	Compute   string `yaml:"compute"`
	Identity  string `yaml:"identity"`
}

// ParseFile reads and parses a manifest YAML file from the given path.
func ParseFile(path string) (*Manifest, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("reading manifest file: %w", err)
	}
	return Parse(data)
}

// Parse parses a manifest from raw YAML bytes.
func Parse(data []byte) (*Manifest, error) {
	var m Manifest
	if err := yaml.Unmarshal(data, &m); err != nil {
		return nil, fmt.Errorf("parsing manifest YAML: %w", err)
	}
	if err := validate(&m); err != nil {
		return nil, err
	}
	return &m, nil
}

func validate(m *Manifest) error {
	if m.Application == "" {
		return fmt.Errorf("manifest must specify an application name")
	}
	if len(m.Providers) == 0 {
		return fmt.Errorf("manifest must specify at least one provider")
	}
	return nil
}
