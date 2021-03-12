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

GREEN() { echo -e "\n\033[0;32m$1\033[0m"; }

# Try to determine the PR number.
curl -sS https://raw.githubusercontent.com/ampproject/amphtml/master/.circleci/get_pr_number.sh | bash
if [[ -f "$BASH_ENV" ]]; then
  source $BASH_ENV
fi

# If PR_NUMBER doesn't exist, there is nothing more to do.
if [[ -z "$PR_NUMBER" ]]; then
  exit 0
fi

# GitHub provides refs/pull/<PR_NUMBER>/merge, an up-to-date merge branch for
# every PR branch that can be cleanly merged to master. For more details, see:
# https://discuss.circleci.com/t/show-test-results-for-prospective-merge-of-a-github-pr/1662
MERGE_BRANCH="refs/pull/$PR_NUMBER/merge"
echo $(GREEN "Computing merge SHA of $MERGE_BRANCH...")
CIRCLE_MERGE_SHA="$(git ls-remote https://github.com/ampproject/amphtml.git "$MERGE_BRANCH" | awk '{print $1}')"

echo "$CIRCLE_MERGE_SHA" > .CIRCLECI_MERGE_COMMIT
echo $(GREEN "Stored merge SHA $CIRCLE_MERGE_SHA in .CIRCLECI_MERGE_COMMIT.")
exit 0
