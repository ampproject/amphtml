#!/bin/bash

#
# This script copies Validator.java from bazel-bin directory.
#

# Fall back to bazel build working directory if not using Maven
BASE_DIR=$1
if [ -z "$BASE_DIR" ]
then
  BASE_DIR=$BUILD_WORKING_DIRECTORY
fi
BAZEL_BIN_DIR=$BASE_DIR/bazel-bin
AMP_VALIDATOR_GENERATED_DIR=$BASE_DIR/"src/main/java/dev/amp/validator"

cd $BAZEL_BIN_DIR
jar xvf amphtml_validator_proto_lib-speed-src.jar >/dev/null

if [[ -z "$TRAVIS" ]]; then
  echo "Copying Validator.java from ${BAZEL_BIN_DIR}/dev/amp/validator"
fi
cp $BAZEL_BIN_DIR/dev/amp/validator/ValidatorProtos.java $AMP_VALIDATOR_GENERATED_DIR/.
