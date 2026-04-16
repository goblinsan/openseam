// Package resolver maps OpenSeam patterns to Terraform module references.
package resolver

import (
	"github.com/openseam/generators/terraform/internal/parser"
)

// ModuleMapping describes the Terraform modules required for a provider's services.
type ModuleMapping struct {
	Provider string
	Modules  []TerraformModule
}

// TerraformModule represents a single Terraform module reference.
type TerraformModule struct {
	Name   string
	Source string
	Vars   map[string]string
}

// Resolve maps the manifest providers to their Terraform module definitions.
func Resolve(manifest *parser.Manifest, appName string) []ModuleMapping {
	var mappings []ModuleMapping

	for provider, cfg := range manifest.Providers {
		mm := ModuleMapping{Provider: provider}

		if cfg.Storage != "" {
			mm.Modules = append(mm.Modules, TerraformModule{
				Name:   "storage",
				Source: "../modules/storage",
				Vars:   map[string]string{"bucket_name": appName + "-storage"},
			})
		}
		if cfg.Messaging != "" {
			mm.Modules = append(mm.Modules, TerraformModule{
				Name:   "messaging",
				Source: "../modules/messaging",
				Vars:   map[string]string{"queue_name": appName + "-queue"},
			})
		}
		if cfg.Compute != "" {
			mm.Modules = append(mm.Modules, TerraformModule{
				Name:   "compute",
				Source: "../modules/compute",
				Vars:   map[string]string{"function_name": appName + "-function"},
			})
		}

		mappings = append(mappings, mm)
	}

	return mappings
}
