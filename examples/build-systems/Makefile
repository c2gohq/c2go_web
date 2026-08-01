C2GO_CLANG ?= c2go-clang
C2GO_AR ?= c2go-lto
C2GO_BIND ?= c2go-bind
C2GO_TARGET ?= x86_64-unknown-linux-goabi
C2GO_PACKAGE ?= example.com/build-system/translated
C2GO_GO_OUT ?= translated

C2GO_BUILD := .c2go-build/$(C2GO_TARGET)
C2GO_SOURCE := .c2go-src/add.c
C2GO_OBJECT := $(C2GO_BUILD)/add.o
C2GO_DEPFILE := $(C2GO_OBJECT:.o=.d)
C2GO_ARCHIVE := $(C2GO_BUILD)/translated.a

.PHONY: c2go-generate
c2go-generate: $(C2GO_ARCHIVE)
	@mkdir -p $(C2GO_GO_OUT)
	$(C2GO_BIND) --goname=translated --out=$(C2GO_GO_OUT) $<

$(C2GO_ARCHIVE): $(C2GO_OBJECT)
	$(C2GO_AR) rcs $@ $^

$(C2GO_OBJECT): $(C2GO_SOURCE)
	@mkdir -p $(@D)
	$(C2GO_CLANG) --target=$(C2GO_TARGET) \
		-fc2go -fc2go-package=$(C2GO_PACKAGE) \
		-std=c17 -O2 \
		-MMD -MP -MF $(C2GO_DEPFILE) -MT $@ \
		-c $< -o $@

-include $(C2GO_DEPFILE)
