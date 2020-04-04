#!/bin/bash

#
# This is a pre hook script which executes before compiling the codes.
#
# Concatenate all protoascii files into a single file, validator-all.protoascii,
# under /src/main/resources directory.
#

# Fall back to bazel build working directory if not using Maven
BASE_DIR=$1
if [ -z "$BASE_DIR" ]
then
      BASE_DIR=$BUILD_WORKING_DIRECTORY
fi

AMP_VALIDATOR_PROTOASCII="validator-all.protoascii"
AMP_VALIDATOR_PROTO="validator.proto"
AMP_VALIDATOR_PROTO_DIR=$BASE_DIR/"src/main/proto"
AMP_RESOURCES_DIR=$BASE_DIR/"src/main/resources"
AMP_VALIDATOR_GENERATED_DIR=$BASE_DIR/"src/main/java/amp/validator"

if [[ -f "$AMP_VALIDATOR_PROTO_DIR/$AMP_VALIDATOR_PROTO" && -f "$AMP_RESOURCES_DIR/$AMP_VALIDATOR_PROTOASCII" ]]; then
    echo "Both $AMP_VALIDATOR_PROTO && $AMP_VALIDATOR_PROTOASCII exists";
else
    # Creating proto & resources directories.
    mkdir -p ${AMP_VALIDATOR_GENERATED_DIR}
    mkdir -p ${AMP_VALIDATOR_PROTO_DIR}
    mkdir -p ${AMP_RESOURCES_DIR}

    pushd $BASE_DIR

    echo "Append validator main proto asci files"
    cat ../validator-main.protoascii >> ${AMP_RESOURCES_DIR}/${AMP_VALIDATOR_PROTOASCII};

    echo "Append validator css proto ascii files"
    cat ../validator-css.protoascii >> ${AMP_RESOURCES_DIR}/${AMP_VALIDATOR_PROTOASCII};

    echo "Concatenate all extension proto asci files"
    for i in `find ../../extensions -name "*.protoascii"`; do
        echo $i;
        cat $i >> ${AMP_RESOURCES_DIR}/${AMP_VALIDATOR_PROTOASCII};
    done

    popd
fi
