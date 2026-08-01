package build_system_test

import (
	"testing"

	"example.com/build-system/translated"
)

func TestGeneratedPackage(t *testing.T) {
	if got := translated.Add(20, 22); got != 42 {
		t.Fatalf("translated.Add(20, 22) = %d, want 42", got)
	}
}
