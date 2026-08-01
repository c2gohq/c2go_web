# Build-system integration example

This example verifies the Makefile and CMake patterns documented on the C2Go website. Both generate the same `example.com/build-system/translated` Go package from `.c2go-src/add.c`.

With the matching SDK on `PATH`:

```sh
go mod init example.com/build-system
go get github.com/c2gohq/c2go_libc@v0.20260801.0-rc.2

make c2go-generate
go test ./...
```

Or use the independent CMake adapter target:

```sh
cmake -S . -B .c2go-cmake -G Ninja \
  -DCMAKE_C_COMPILER=c2go-clang
cmake --build .c2go-cmake --target c2go_translated
go test ./...
```
