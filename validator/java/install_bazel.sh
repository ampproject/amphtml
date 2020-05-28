#!/bin/bash
#
# Copyright 2020 The AMP HTML Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the license.
#
# This script installs Bazel, either by downloading it or by installing from the
# Travis cache if available.

set -e # Exit on error

CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }
GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }

LOG_PREFIX=$(YELLOW "install_bazel.sh")
BAZEL_VERSION="3.0.0"
INSTALLER_DIR="bazel-installer"


if [[ "$OSTYPE" == "linux-gnu" ]]; then
  BAZEL_INSTALLER="bazel_$BAZEL_VERSION-linux-x86_64.deb"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  BAZEL_INSTALLER="bazel-$BAZEL_VERSION-installer-darwin-x86_64.sh"
else
  echo "$LOG_PREFIX Installing Bazel on $(CYAN "$OSTYPE") is not yet supported; aborting"
  exit 1
fi

BAZEL_BIN_URL="https://github.com/bazelbuild/bazel/releases/download/$BAZEL_VERSION/$BAZEL_INSTALLER"
BAZEL_BIN_PATH="$INSTALLER_DIR/$BAZEL_INSTALLER"

BAZEL_BIN_SHA_URL="$BAZEL_BIN_URL.sha256"
BAZEL_BIN_SHA_PATH="$BAZEL_BIN_PATH.sha256"
BAZEL_INSTALLER_SHA="$BAZEL_INSTALLER.sha256"

if type bazel &>/dev/null ; then
  echo "$LOG_PREFIX Bazel binary detected at $(CYAN "$BAZEL_BIN_PATH"); skipping installation"
  exit
fi

if [[ -f $BAZEL_BIN_PATH ]]; then
  echo "$LOG_PREFIX Using cached Bazel binary $(CYAN "$BAZEL_BIN_PATH")"
else
  echo "$LOG_PREFIX Downloading $(CYAN "$BAZEL_BIN_URL")..."
  mkdir -p $INSTALLER_DIR
  curl -s --create-dirs -o "$BAZEL_BIN_PATH" -L "$BAZEL_BIN_URL"
  curl -s --create-dirs -o "$BAZEL_BIN_SHA_PATH" -L "$BAZEL_BIN_SHA_URL"
fi

echo "$LOG_PREFIX Verifying sha256 integrity of $(CYAN "$BAZEL_BIN_PATH")..."
(cd "$INSTALLER_DIR" && shasum -c "$BAZEL_INSTALLER_SHA" >/dev/null)

echo "$LOG_PREFIX Installing $(CYAN "bazel") from $(CYAN "$BAZEL_BIN_PATH")..."
if [[ "$OSTYPE" == "linux-gnu" ]]; then
  sudo dpkg -i $BAZEL_BIN_PATH  >/dev/null 2>&1
elif [[ "$OSTYPE" == "darwin"* ]]; then
  chmod +x $BAZEL_BIN_PATH
  sudo ./$BAZEL_BIN_PATH --user >/dev/null 2>&1
fi
