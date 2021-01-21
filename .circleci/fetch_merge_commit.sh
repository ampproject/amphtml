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
# This script fetches the merge commit of a PR branch with master.

set -e
err=0

if [ -z "$CIRCLE_PR_NUMBER" ]; then
  echo -e "Nothing to do because this is not a PR build."
  exit
fi

# GitHub provides refs/pull/<PR_NUMBER>/merge for every PR branch that can be
# cleanly merged to `master`. See this discussion for more details:
# https://discuss.circleci.com/t/show-test-results-for-prospective-merge-of-a-github-pr/1662
MERGE_BRANCH="refs/pull/$CIRCLE_PR_NUMBER/merge"
(set -x && git pull --ff-only origin "$MERGE_BRANCH") || err=$?

if [ "$err" -ne "0" ]; then
  echo
  echo -e "ERROR: Detected a merge conflict between $CIRCLE_BRANCH and master."
  echo -e "Please rebase your PR branch."
  exit $err
fi

echo -e "Successfully fetched merge commit of $CIRCLE_BRANCH with master."
