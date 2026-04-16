// Package secrets defines the portable secrets interface for the OpenSeam SDK.
package secrets

// SecretsManager is the portable interface for cloud secrets and configuration services.
type SecretsManager interface {
	// GetSecret retrieves the value of a secret by name.
	GetSecret(name string) (string, error)

	// SetSecret stores or updates a secret value.
	SetSecret(name, value string) error

	// DeleteSecret removes a secret.
	DeleteSecret(name string) error
}
