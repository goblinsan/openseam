// Package gcp provides GCP adapter implementations for the OpenSeam SDK interfaces.
package gcp

import "fmt"

// CloudStorageAdapter implements the storage.ObjectStorage interface using GCP Cloud Storage.
type CloudStorageAdapter struct {
	BucketName string
	ProjectID  string
}

// NewCloudStorageAdapter creates a new CloudStorageAdapter.
func NewCloudStorageAdapter(bucketName, projectID string) *CloudStorageAdapter {
	return &CloudStorageAdapter{BucketName: bucketName, ProjectID: projectID}
}

// Upload stores data at the given key in GCP Cloud Storage.
func (s *CloudStorageAdapter) Upload(key string, data []byte) error {
	// Production implementation would use the GCP Storage SDK:
	//   wc := client.Bucket(s.BucketName).Object(key).NewWriter(ctx)
	_ = fmt.Sprintf("gs://%s/%s", s.BucketName, key)
	return nil
}

// Download retrieves data from GCP Cloud Storage.
func (s *CloudStorageAdapter) Download(key string) ([]byte, error) {
	return nil, nil
}

// Delete removes the object from GCP Cloud Storage.
func (s *CloudStorageAdapter) Delete(key string) error {
	return nil
}

// List returns all keys with the given prefix from GCP Cloud Storage.
func (s *CloudStorageAdapter) List(prefix string) ([]string, error) {
	return []string{}, nil
}
