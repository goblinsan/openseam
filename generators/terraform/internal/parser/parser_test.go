package parser_test

import (
	"testing"

	"github.com/openseam/generators/terraform/internal/parser"
)

func TestParse_ValidManifest(t *testing.T) {
	yaml := `
application: invoice-service
providers:
  aws:
    storage: s3
    compute: lambda
  gcp:
    storage: gcs
`
	m, err := parser.Parse([]byte(yaml))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	if m.Application != "invoice-service" {
		t.Errorf("expected application 'invoice-service', got %q", m.Application)
	}

	if len(m.Providers) != 2 {
		t.Errorf("expected 2 providers, got %d", len(m.Providers))
	}

	awsCfg, ok := m.Providers["aws"]
	if !ok {
		t.Fatal("expected 'aws' provider in manifest")
	}
	if awsCfg.Storage != "s3" {
		t.Errorf("expected aws storage 's3', got %q", awsCfg.Storage)
	}
}

func TestParse_MissingApplication(t *testing.T) {
	yaml := `
providers:
  aws:
    storage: s3
`
	_, err := parser.Parse([]byte(yaml))
	if err == nil {
		t.Error("expected error for missing application, got nil")
	}
}

func TestParse_MissingProviders(t *testing.T) {
	yaml := `
application: my-app
`
	_, err := parser.Parse([]byte(yaml))
	if err == nil {
		t.Error("expected error for missing providers, got nil")
	}
}

func TestParse_InvalidYAML(t *testing.T) {
	_, err := parser.Parse([]byte("not: valid: yaml: ["))
	if err == nil {
		t.Error("expected error for invalid YAML, got nil")
	}
}
