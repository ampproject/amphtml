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

# This script extracts the PR number (if there is one) for a CircleCI build.
# Reference: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables

set -e
err=0

GREEN() { echo -e "\n\033[0;32m$1\033[0m"; }
YELLOW() { echo -e "\n\033[0;33m$1\033[0m"; }

# Push builds are only run against master and amp-release branches.
if [[ "$CIRCLE_BRANCH" == "master" || "$CIRCLE_BRANCH" =~ ^amp-release-* ]]; then
  echo $(GREEN "Nothing to do because $CIRCLE_BRANCH is not a PR branch.")
  # Warn if the build is linked to a PR on a different repo (known CircleCI bug).
  if [[ -n "$CIRCLE_PULL_REQUEST" && ! "$CIRCLE_PULL_REQUEST" =~ ^https://github.com/ampproject/amphtml* ]]; then
    echo $(YELLOW "WARNING: Build is incorrectly linked to a PR outside ampproject/amphtml:")
    echo $(YELLOW "$CIRCLE_PULL_REQUEST")
  fi
  exit 0
fi

# CIRCLE_PR_NUMBER is present for PRs originating from forks, but absent for PRs
# originating from a branch on the main repo. In such cases, extract the PR
# number from CIRCLE_PULL_REQUEST.
if [[ "$CIRCLE_PR_NUMBER" ]]; then
  PR_NUMBER=$CIRCLE_PR_NUMBER
else
  PR_NUMBER=${CIRCLE_PULL_REQUEST#"https://github.com/ampproject/amphtml/pull/"}
fi

# If neither CIRCLE_PR_NUMBER nor CIRCLE_PULL_REQUEST are available, it's
# possible this is a PR branch that is yet to be associated with a PR. Exit
# early becaue there is no merge commit to fetch.
if [[ -z "$PR_NUMBER" ]]; then
  echo $(GREEN "Nothing to do because $CIRCLE_BRANCH is not yet linked to a PR.")
  exit 0
fi

echo "export PR_NUMBER=$PR_NUMBER" >> $BASH_ENV
echo $(GREEN "This is a PR build for #$PR_NUMBER.")
