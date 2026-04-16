package local

import "sync"

// MemoryMessagingAdapter implements the messaging.MessageQueue interface using in-memory channels.
// Suitable for local development and unit testing only.
type MemoryMessagingAdapter struct {
	mu       sync.RWMutex
	handlers map[string]func([]byte) error
}

// NewMemoryMessagingAdapter creates a new MemoryMessagingAdapter.
func NewMemoryMessagingAdapter() *MemoryMessagingAdapter {
	return &MemoryMessagingAdapter{handlers: make(map[string]func([]byte) error)}
}

// Publish delivers the payload directly to any registered handler for the topic.
func (m *MemoryMessagingAdapter) Publish(topic string, payload []byte) error {
	m.mu.RLock()
	handler, ok := m.handlers[topic]
	m.mu.RUnlock()
	if ok {
		return handler(payload)
	}
	return nil
}

// Subscribe registers a handler for the given topic.
func (m *MemoryMessagingAdapter) Subscribe(topic string, handler func([]byte) error) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.handlers[topic] = handler
	return nil
}
