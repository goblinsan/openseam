// cmd/generate is the CLI entry point for the OpenSeam Terraform Blueprint Generator.
package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"

	"github.com/openseam/generators/terraform/internal/parser"
	"github.com/openseam/generators/terraform/internal/renderer"
	"github.com/openseam/generators/terraform/internal/resolver"
)

func main() {
	manifestPath := flag.String("manifest", "", "Path to the OpenSeam manifest YAML file (required)")
	outputDir := flag.String("output", "terraform", "Output directory for generated Terraform files")
	flag.Parse()

	if *manifestPath == "" {
		fmt.Fprintln(os.Stderr, "error: -manifest flag is required")
		flag.Usage()
		os.Exit(1)
	}

	manifest, err := parser.ParseFile(*manifestPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	mappings := resolver.Resolve(manifest, manifest.Application)

	blueprints, err := renderer.Render(manifest.Application, mappings)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error rendering blueprints: %v\n", err)
		os.Exit(1)
	}

	for _, bp := range blueprints {
		dir := filepath.Join(*outputDir, "environments", bp.Provider)
		if err := os.MkdirAll(dir, 0o755); err != nil {
			fmt.Fprintf(os.Stderr, "error creating output directory: %v\n", err)
			os.Exit(1)
		}

		mainPath := filepath.Join(dir, "main.tf")
		if err := os.WriteFile(mainPath, []byte(bp.MainTF), 0o644); err != nil {
			fmt.Fprintf(os.Stderr, "error writing main.tf: %v\n", err)
			os.Exit(1)
		}

		varPath := filepath.Join(dir, "variables.tf")
		if err := os.WriteFile(varPath, []byte(bp.Variables), 0o644); err != nil {
			fmt.Fprintf(os.Stderr, "error writing variables.tf: %v\n", err)
			os.Exit(1)
		}

		fmt.Printf("✓ Generated blueprint for %s → %s\n", bp.Provider, dir)
	}

	fmt.Printf("\n✅ Blueprint generation complete for application: %s\n", manifest.Application)
}
