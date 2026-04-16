// Package local provides in-memory adapter implementations for local development and testing.
package local

import (
	"fmt"
	"strings"
	"sync"
)

// MemoryStorageAdapter implements the storage.ObjectStorage interface using in-memory maps.
// Suitable for local development and unit testing only.
type MemoryStorageAdapter struct {
	mu   sync.RWMutex
	data map[string][]byte
}

// NewMemoryStorageAdapter creates a new MemoryStorageAdapter.
func NewMemoryStorageAdapter() *MemoryStorageAdapter {
	return &MemoryStorageAdapter{data: make(map[string][]byte)}
}

// Upload stores data at the given key in memory.
func (m *MemoryStorageAdapter) Upload(key string, data []byte) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.data[key] = data
	return nil
}

// Download retrieves data stored at the given key.
func (m *MemoryStorageAdapter) Download(key string) ([]byte, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	data, ok := m.data[key]
	if !ok {
		return nil, fmt.Errorf("key not found: %s", key)
	}
	return data, nil
}

// Delete removes the object stored at the given key.
func (m *MemoryStorageAdapter) Delete(key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	delete(m.data, key)
	return nil
}

// List returns all keys that share the given prefix.
func (m *MemoryStorageAdapter) List(prefix string) ([]string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	var keys []string
	for k := range m.data {
		if strings.HasPrefix(k, prefix) {
			keys = append(keys, k)
		}
	}
	return keys, nil
}
