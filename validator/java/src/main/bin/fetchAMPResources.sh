#!/bin/bash

#
# This is a pre hook script which executes before compiling the codes.
#
# 1. Fetch AMP validator.proto, validator-main.protoascii and all extensions.
# 2. Concatenate all protoascii files into a single file, validator-all.protoascii.
# 3. Move validator.proto under src/proto directory.
# 4. Move validator-all.protoascii under src/main/resources directory.
#

AMP_GIT_URL="https://github.com/ampproject/amphtml.git"
AMP_VALIDATOR_MAIN_PROTO_ASCII="validator-main.protoascii"
AMP_VALIDATOR_PROTOASCII="validator-all.protoascii"
AMP_VALIDATOR_PROTO="validator.proto"

git_setup()
{
   echo "Git init"
   git init

   echo "Git config core.sparseCheckout true"
   git config core.sparseCheckout true
   echo "extensions" >> .git/info/sparse-checkout
   echo "validator/validator-main.protoascii" >> .git/info/sparse-checkout
   echo "validator/validator.proto" >> .git/info/sparse-checkout

   echo "Git remote add origin ${AMP_GIT_URL}"
   git remote add origin ${AMP_GIT_URL}

   echo "Git checkout 1910222037440"
   git fetch --depth 1 origin tag 1911070201440
   git checkout 1911070201440
}

concatenate_protoascii_files()
{
   echo "Append validator main proto asci files"
   cat validator/validator-main.protoascii >> ${AMP_VALIDATOR_PROTOASCII};

   echo "Concatenate all extension proto asci files"
   for i in `find extensions -name "*.protoascii"`; do
        echo $i;
        cat $i >> ${AMP_VALIDATOR_PROTOASCII};
    done
}

# Fall back to bazel build working directory if not using Maven
BASE_DIR=$1
if [ -z "$BASE_DIR" ]
then
      BASE_DIR=$BUILD_WORKING_DIRECTORY
fi

AMP_VALIDATOR_PROTO_DIR=$BASE_DIR/"src/main/proto"
AMP_RESOURCES_DIR=$BASE_DIR/"src/main/resources"
AMP_HTML_DIR=$BASE_DIR/"src/main/amphtml"
AMP_VALIDATOR_GENERATED_DIR=$BASE_DIR/"src/main/java/amp/validator"

echo "Check $AMP_VALIDATOR_PROTO_DIR/$AMP_VALIDATOR_PROTO && $AMP_RESOURCES_DIR/$AMP_VALIDATOR_PROTOASCII exists"
if [[ -f "$AMP_VALIDATOR_PROTO_DIR/$AMP_VALIDATOR_PROTO" && -f "$AMP_RESOURCES_DIR/$AMP_VALIDATOR_PROTOASCII" ]]; then
    echo "Skipping checkout amphtml repo"
    echo "Both $AMP_VALIDATOR_PROTO && $AMP_VALIDATOR_PROTOASCII exists";
else
    # Creating proto & resources directories.
    mkdir -p ${AMP_VALIDATOR_GENERATED_DIR}
    mkdir -p ${AMP_VALIDATOR_PROTO_DIR}
    mkdir -p ${AMP_RESOURCES_DIR}

    mkdir -p $AMP_HTML_DIR
    cd $AMP_HTML_DIR

    git_setup

    concatenate_protoascii_files

    echo "Copying ${AMP_VALIDATOR_PROTOASCII} to ${AMP_RESOURCES_DIR}"
    mv $AMP_HTML_DIR/${AMP_VALIDATOR_PROTOASCII} ${AMP_RESOURCES_DIR}

    echo "Copying ${AMP_VALIDATOR_PROTO} to ${AMP_VALIDATOR_PROTO_DIR}"
    mv $AMP_HTML_DIR/validator/${AMP_VALIDATOR_PROTO} ${AMP_VALIDATOR_PROTO_DIR}

    # Removing amphtml directory.
    rm -rf $AMP_HTML_DIR
fi
