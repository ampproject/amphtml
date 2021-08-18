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

# This script establishes the merge commit at the start of a CircleCI build so
# all stages use the same commit.

set -e
err=0

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }

# Ensure the CircleCI workspace directory exists.
mkdir -p /tmp/workspace

# Try to determine the PR number.
./.circleci/get_pr_number.sh
if [[ -f "${BASH_ENV}" ]]; then
  source $BASH_ENV
fi

# If PR_NUMBER doesn't exist, there is nothing more to do.
if [[ -z "${PR_NUMBER}" ]]; then
  exit 0
fi

echo "$(GREEN "Fetching") $(CYAN "main") $(GREEN "branch to update") $(CYAN ".git") $(GREEN "cache.")"
git fetch origin main:main

# GitHub provides refs/pull/<PR_NUMBER>/merge, an up-to-date merge branch for
# every PR branch that can be cleanly merged to the main branch. For more
# details, see: https://discuss.circleci.com/t/show-test-results-for-prospective-merge-of-a-github-pr/1662
MERGE_BRANCH="refs/pull/${PR_NUMBER}/merge"

# Fetch the merge commit. This ensures that all CI stages use the same commit.
echo "$(GREEN "Fetching the PR's merge branch") $(CYAN "${MERGE_BRANCH}")"
(set -x && git pull --ff-only origin "${MERGE_BRANCH}") || err=$?

# If a clean merge is not possible, do not proceed with the build. GitHub's UI
# will show an error indicating there was a merge conflict.
if [[ "$err" -ne "0" ]]; then
  echo "$(RED "Detected a merge conflict between") $(CYAN "${CIRCLE_BRANCH}") $(RED "and the") $(CYAN "main") $(RED "branch.")"
  echo "$(RED "Please rebase your PR branch.")"
  exit $err
fi

# Store the merge commit info in the CircleCI workspace for use by followup
# jobs.
CIRCLE_MERGE_SHA="$(git rev-parse --verify HEAD)"
echo "$CIRCLE_MERGE_SHA" > /tmp/workspace/.CIRCLECI_MERGE_COMMIT
echo "$(GREEN "Stored merge SHA") $(CYAN "${CIRCLE_MERGE_SHA}") $(GREEN "in") $(CYAN "/tmp/workspace/.CIRCLECI_MERGE_COMMIT.")"
exit 0
