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

# Script used by AMP's CI builds to install project dependencies on GH Actions.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  echo $(GREEN "Updating npm prefix...")
  npm config set prefix "$HOME/.npm"

  echo $(GREEN "Updating PATH...")
  echo "export PATH=$HOME/.npm/bin:$PATH" >> $GITHUB_ENV && source $GITHUB_ENV # For now
  echo "$HOME/.npm/bin" >> $GITHUB_PATH # For later
fi

echo $(GREEN "Enabling log coloring...")
echo "FORCE_COLOR=1" >> $GITHUB_ENV

echo $(GREEN "Installing dependencies...")
npm ci

echo $(GREEN "Successfully installed all project dependencies.")
