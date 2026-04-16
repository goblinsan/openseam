// Package compute defines the portable compute interface for the OpenSeam SDK.
package compute

// ComputeRunner is the portable interface for invoking cloud compute functions.
type ComputeRunner interface {
	// Invoke triggers a named function with the provided input payload.
	Invoke(functionName string, input []byte) ([]byte, error)
}
