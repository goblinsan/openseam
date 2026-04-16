// Package storage defines the portable object storage interface for the OpenSeam SDK.
package storage

// ObjectStorage is the portable interface for cloud object storage services.
// Implementations exist for AWS S3, GCP Cloud Storage, Azure Blob Storage, and local.
type ObjectStorage interface {
	// Upload stores data at the given key.
	Upload(key string, data []byte) error

	// Download retrieves data stored at the given key.
	Download(key string) ([]byte, error)

	// Delete removes the object stored at the given key.
	Delete(key string) error

	// List returns a slice of keys that share the given prefix.
	List(prefix string) ([]string, error)
}
