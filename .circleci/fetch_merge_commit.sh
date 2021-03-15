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

# This script fetches the merge commit of a PR branch with master to make sure
# PRs are tested against all the latest changes on CircleCI.

set -e
err=0

GREEN() { echo -e "\n\033[0;32m$1\033[0m"; }
RED() { echo -e "\n\033[0;31m$1\033[0m"; }

# Try to determine the PR number.
./.circleci/get_pr_number.sh
if [[ -f "$BASH_ENV" ]]; then
  source $BASH_ENV
fi

# If PR_NUMBER doesn't exist, there is nothing more to do.
if [[ -z "$PR_NUMBER" ]]; then
  exit 0
fi

# If PR_NUMBER exists, but the merge commit file doesn't exist, the PR was
# created after the first stage of CI was run. There is nothing more to do.
if [[ ! -f .CIRCLECI_MERGE_COMMIT ]]; then
  exit 0
fi

# Extract the merge commit for this workflow and make it visible to other steps.
CIRCLECI_MERGE_COMMIT="$(cat .CIRCLECI_MERGE_COMMIT)"
echo "export CIRCLECI_MERGE_COMMIT=$CIRCLECI_MERGE_COMMIT" >> $BASH_ENV

# Fetch the merge commit. This ensures that all CI stages use the same commit.
echo $(GREEN "Fetching merge commit $CIRCLECI_MERGE_COMMIT...")
(set -x && git pull --ff-only origin "$CIRCLECI_MERGE_COMMIT") || err=$?

# If a clean merge is not possible, do not proceed with the build. GitHub's UI
# will show an error indicating there was a merge conflict.
if [[ "$err" -ne "0" ]]; then
  echo $(RED "Detected a merge conflict between $CIRCLE_BRANCH and master.")
  echo $(RED "Please rebase your PR branch.")
  exit $err
fi

echo $(GREEN "Successfully fetched merge commit of $CIRCLE_BRANCH with master.")
