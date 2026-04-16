// Package identity defines the portable identity interface for the OpenSeam SDK.
package identity

// IdentityProvider is the portable interface for cloud authentication services.
type IdentityProvider interface {
	// GetToken retrieves an access token for the given scope.
	GetToken(scope string) (string, error)

	// ValidateToken checks whether the provided token is valid.
	ValidateToken(token string) (bool, error)
}
