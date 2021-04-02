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

# Script used by AMP's CI builds to install project dependencies on CircleCI.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash

echo $(GREEN "Restoring NVM environment...")
export NVM_DIR="$HOME/.nvm"
mv /tmp/workspace/.nvm $NVM_DIR
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo $(GREEN "Restoring npm environment...")
NPM_BIN_DIR="`npm config get prefix`/bin"
(set -x && echo "export PATH=$NPM_BIN_DIR:$PATH" >> $BASH_ENV)

echo $(GREEN "Restoring node_modules...")
mv /tmp/workspace/node_modules .
