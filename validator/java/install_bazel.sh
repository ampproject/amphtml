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
CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }
GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }

LOG_PREFIX=$(YELLOW "install_bazel.sh")
BAZEL_VERSION="2.2.0"
BAZEL_BIN_SHA="b1b8dba9b625b10e47a6dcc027abfdaf213b454709d32473c81c146ba8ccb8e3"
INSTALLER_DIR="bazel-installer"

# TODO(rsima): Add support for installs on Darwin.
if [[ "$OSTYPE" == "linux-gnu" ]]; then
  PLATFORM="linux"
  BAZEL_INSTALLER="bazel_$BAZEL_VERSION-$PLATFORM-x86_64.deb"
else
  echo "$LOG_PREFIX Installing Bazel on $(CYAN "$OSTYPE") is not yet supported; aborting"
  exit 1
fi

BAZEL_BIN_URL="https://github.com/bazelbuild/bazel/releases/download/$BAZEL_VERSION/$BAZEL_INSTALLER"
BAZEL_BIN_PATH="$INSTALLER_DIR/$BAZEL_INSTALLER"

if type bazel &>/dev/null ; then
  echo "$LOG_PREFIX Bazel binary detected at $(CYAN "$BAZEL_BIN_PATH"); skipping installation"
  exit
fi

if [[ -f $BAZEL_BIN_PATH ]]; then
  echo "$LOG_PREFIX Using cached Bazel binary $(CYAN "$BAZEL_BIN_PATH")"
else
  echo "$LOG_PREFIX Downloading $(CYAN "$BAZEL_BIN_URL")..."
  mkdir -p $INSTALLER_DIR
  wget -q -O $BAZEL_BIN_PATH $BAZEL_BIN_URL
  echo "SHA256 ($BAZEL_BIN_PATH) = $BAZEL_BIN_SHA" | sha256sum -c -
fi

echo "$LOG_PREFIX Installing $(CYAN "bazel") from $(CYAN "$BAZEL_BIN_PATH")..."
sudo dpkg -i $BAZEL_BIN_PATH
