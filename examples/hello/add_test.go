package hello_c2go_test

import (
	"testing"

	"example.com/hello-c2go/translated"
)

func TestAdd(t *testing.T) {
	got := translated.Add(20, 22)
	if got != 42 {
		t.Fatalf("translated.Add(20, 22) = %d, want 42", got)
	}
}
