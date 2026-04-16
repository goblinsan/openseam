package local_test

import (
	"testing"

	"github.com/openseam/adapters/local"
)

func TestMemoryStorageAdapter_UploadDownload(t *testing.T) {
	adapter := local.NewMemoryStorageAdapter()

	key := "test/file.txt"
	data := []byte("hello, seam")

	if err := adapter.Upload(key, data); err != nil {
		t.Fatalf("Upload failed: %v", err)
	}

	got, err := adapter.Download(key)
	if err != nil {
		t.Fatalf("Download failed: %v", err)
	}

	if string(got) != string(data) {
		t.Errorf("expected %q, got %q", string(data), string(got))
	}
}

func TestMemoryStorageAdapter_Delete(t *testing.T) {
	adapter := local.NewMemoryStorageAdapter()

	_ = adapter.Upload("key", []byte("data"))
	_ = adapter.Delete("key")

	_, err := adapter.Download("key")
	if err == nil {
		t.Error("expected error after deleting key, got nil")
	}
}

func TestMemoryStorageAdapter_List(t *testing.T) {
	adapter := local.NewMemoryStorageAdapter()

	_ = adapter.Upload("docs/a.txt", []byte("a"))
	_ = adapter.Upload("docs/b.txt", []byte("b"))
	_ = adapter.Upload("images/c.png", []byte("c"))

	keys, err := adapter.List("docs/")
	if err != nil {
		t.Fatalf("List failed: %v", err)
	}

	if len(keys) != 2 {
		t.Errorf("expected 2 keys, got %d: %v", len(keys), keys)
	}
}

func TestMemoryMessagingAdapter_PublishSubscribe(t *testing.T) {
	adapter := local.NewMemoryMessagingAdapter()

	received := make([]byte, 0)
	_ = adapter.Subscribe("orders", func(payload []byte) error {
		received = payload
		return nil
	})

	msg := []byte(`{"order_id": "123"}`)
	if err := adapter.Publish("orders", msg); err != nil {
		t.Fatalf("Publish failed: %v", err)
	}

	if string(received) != string(msg) {
		t.Errorf("expected %q, got %q", string(msg), string(received))
	}
}

func TestMemoryMessagingAdapter_PublishNoSubscriber(t *testing.T) {
	adapter := local.NewMemoryMessagingAdapter()
	// Publishing to a topic with no subscriber should succeed silently.
	if err := adapter.Publish("no-topic", []byte("data")); err != nil {
		t.Errorf("expected nil error, got %v", err)
	}
}
