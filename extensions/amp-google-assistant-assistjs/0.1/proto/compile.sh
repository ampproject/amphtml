#!/bin/bash

# doc: https://developers.google.com/protocol-buffers/docs/reference/javascript-generated#commonjs-imports

PROTOC=protoc/bin/protoc

$PROTOC --js_out=import_style=commonjs,binary:. frame-service.proto