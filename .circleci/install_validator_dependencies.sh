#!/bin/bash
#
# Script used by AMP's CI builds to install AMP Validator dependencies on
# CircleCI.

set -e

JDK_VERSION="1.8"
BAZEL_VERSION="5.4.0"
PROTOBUF_VERSION="3.19.4"

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

echo $(GREEN "Adding Bazel repo...")
curl -fsSL https://bazel.build/bazel-release.pub.gpg | gpg --dearmor > bazel.gpg
sudo mv bazel.gpg /etc/apt/trusted.gpg.d/
echo "deb [arch=amd64] https://storage.googleapis.com/bazel-apt stable jdk${JDK_VERSION}" | sudo tee /etc/apt/sources.list.d/bazel.list

echo $(GREEN "Updating and installing apt packages...")
sudo apt update && sudo apt install bazel-${BAZEL_VERSION} clang python3 python3-pip protobuf-compiler
sudo ln -s $(which "bazel-${BAZEL_VERSION}") /usr/bin/bazel

echo $(GREEN "Installing protobuf python module...")
pip3 install protobuf==${PROTOBUF_VERSION}
