cmake_minimum_required(VERSION 3.20)
set(CMAKE_TRY_COMPILE_TARGET_TYPE STATIC_LIBRARY)
project(c2go_build_system_example LANGUAGES C)

if(APPLE)
  set(CMAKE_OSX_SYSROOT "" CACHE PATH "C2Go does not use host libc headers" FORCE)
endif()

find_program(C2GO_LTO NAMES c2go-lto REQUIRED)
find_program(C2GO_BIND NAMES c2go-bind REQUIRED)

set(C2GO_TARGET "x86_64-unknown-linux-goabi" CACHE STRING "C2Go target triple")
set(C2GO_PACKAGE "example.com/build-system/translated" CACHE STRING "Go import path")
set(C2GO_GO_OUT "${CMAKE_CURRENT_SOURCE_DIR}/translated" CACHE PATH "Generated Go package")

set(CMAKE_C_ARCHIVE_CREATE "\"${C2GO_LTO}\" qc <TARGET> <OBJECTS>")
set(CMAKE_C_ARCHIVE_FINISH "\"${CMAKE_COMMAND}\" -E true")

add_library(c2go_translated STATIC .c2go-src/add.c)
target_compile_options(c2go_translated PRIVATE
  "--target=${C2GO_TARGET}"
  -fc2go
  "-fc2go-package=${C2GO_PACKAGE}"
  -std=c17
  -O2
  -emit-llvm
)
set_target_properties(c2go_translated PROPERTIES
  PREFIX ""
  SUFFIX ".a"
  OUTPUT_NAME "translated"
)

add_custom_command(
  TARGET c2go_translated POST_BUILD
  COMMAND "${CMAKE_COMMAND}" -E make_directory "${C2GO_GO_OUT}"
  COMMAND "${C2GO_BIND}"
          --goname=translated
          "--out=${C2GO_GO_OUT}"
          "$<TARGET_FILE:c2go_translated>"
  VERBATIM
)
