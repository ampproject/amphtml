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

# This script checks if a PR branch is using the most recent CircleCI config.
# Reference: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables

set -e
err=0

GREEN() { echo -e "\n\033[0;32m$1\033[0m"; }
RED() { echo -e "\n\033[0;31m$1\033[0m"; }

# Push builds are only run against master and amp-release branches.
if [[ "$CIRCLE_BRANCH" == "master" || "$CIRCLE_BRANCH" =~ ^amp-release-* ]]; then
  echo $(GREEN "Nothing to do because $CIRCLE_BRANCH is not a PR branch.")
  exit 0
fi

# Check if the PR branch contains the most recent revision the CircleCI config.
CONFIG_REV=`git rev-list master -1 -- .circleci/config.yml`
(set -x && git merge-base --is-ancestor $CONFIG_REV $CIRCLE_SHA1) || err=$?

if [[ "$err" -ne "0" ]]; then
  echo $(RED "$CIRCLE_BRANCH is missing the latest CircleCI config revision $CONFIG_REV.")
  echo $(RED "Please rebase / merge $CIRCLE_BRANCH with master.")
  exit 1
fi

echo $(GREEN "$CIRCLE_BRANCH is using the latest CircleCI config.")
