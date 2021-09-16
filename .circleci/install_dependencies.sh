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
#
# Script used by AMP's CI builds to install project dependencies.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

echo $(GREEN "Installing NVM...")
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

echo $(GREEN "Setting up NVM environment...")
export NVM_DIR="/opt/circleci/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

echo $(GREEN "Installing Node LTS...")
nvm install 'lts/*'

echo $(GREEN "Installing gulp-cli...")
npm install --global gulp-cli

echo $(GREEN "Installing dependencies...")
npm ci

echo $(GREEN "Setting up environment...")
NODE_BIN=`which node`
(set -x && echo "export PATH=`dirname $NODE_BIN`:$PATH" >> $BASH_ENV)

echo $(GREEN "Successfully installed all project dependencies.")
