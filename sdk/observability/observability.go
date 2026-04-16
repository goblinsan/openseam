// Package observability defines the portable observability interface for the OpenSeam SDK.
package observability

// Logger is the portable interface for structured logging.
type Logger interface {
	// Info logs an informational message with optional key-value fields.
	Info(msg string, fields map[string]interface{})

	// Warn logs a warning message with optional key-value fields.
	Warn(msg string, fields map[string]interface{})

	// Error logs an error message with optional key-value fields.
	Error(msg string, fields map[string]interface{})
}
