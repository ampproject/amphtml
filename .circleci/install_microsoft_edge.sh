#!/bin/bash
#
# Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

# Script used by AMP's CI builds to install Microsoft Edge Beta on CircleCI.
# Reference: https://www.microsoftedgeinsider.com/en-us/download?platform=linux-deb
# TODO(rsimha): Switch from Beta to Stable once it's available.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

echo "$(GREEN "Installing Microsoft Edge...")"
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'
sudo rm microsoft.gpg
sudo apt update && sudo apt install microsoft-edge-beta
EDGE_BETA_BIN=`which microsoft-edge-beta`
echo "export EDGE_BETA_BIN=${EDGE_BETA_BIN}" >> $BASH_ENV
echo $(GREEN "Installation complete.")
