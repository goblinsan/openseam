// Package messaging defines the portable messaging interface for the OpenSeam SDK.
package messaging

// MessageQueue is the portable interface for cloud messaging services.
// Implementations exist for AWS SQS, GCP Pub/Sub, Azure Service Bus, and local.
type MessageQueue interface {
	// Publish sends a message payload to the named topic.
	Publish(topic string, payload []byte) error

	// Subscribe registers a handler function for incoming messages on the named topic.
	Subscribe(topic string, handler func([]byte) error) error
}
