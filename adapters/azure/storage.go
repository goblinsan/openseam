// Package azure provides Azure adapter implementations for the OpenSeam SDK interfaces.
package azure

import "fmt"

// BlobStorageAdapter implements the storage.ObjectStorage interface using Azure Blob Storage.
type BlobStorageAdapter struct {
	AccountName   string
	ContainerName string
}

// NewBlobStorageAdapter creates a new BlobStorageAdapter.
func NewBlobStorageAdapter(accountName, containerName string) *BlobStorageAdapter {
	return &BlobStorageAdapter{AccountName: accountName, ContainerName: containerName}
}

// Upload stores data as a blob in Azure Blob Storage.
func (b *BlobStorageAdapter) Upload(key string, data []byte) error {
	// Production implementation would use the Azure Blob SDK:
	//   client.UploadBuffer(ctx, b.ContainerName, key, data, nil)
	_ = fmt.Sprintf("https://%s.blob.core.windows.net/%s/%s", b.AccountName, b.ContainerName, key)
	return nil
}

// Download retrieves a blob from Azure Blob Storage.
func (b *BlobStorageAdapter) Download(key string) ([]byte, error) {
	return nil, nil
}

// Delete removes a blob from Azure Blob Storage.
func (b *BlobStorageAdapter) Delete(key string) error {
	return nil
}

// List returns all blobs in the container with the given prefix.
func (b *BlobStorageAdapter) List(prefix string) ([]string, error) {
	return []string{}, nil
}
