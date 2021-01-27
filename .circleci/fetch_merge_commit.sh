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
# This script fetches the merge commit of a PR branch with master to make sure
# PRs are tested against all the latest changes.

set -e
err=0

# CIRCLE_PULL_REQUEST is present for PR builds, and absent for push builds.
# See https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables.
if [[ -z "$CIRCLE_PULL_REQUEST" ]]; then
  echo -e "Nothing to do because this is not a PR build."
  exit 0
fi

# Make sure the PR is on ampproject/amphtml and not on a fork.
if [[ ! "$CIRCLE_PULL_REQUEST" =~ ^https://github.com/ampproject/amphtml* ]]; then
  echo -e "This is a PR build, but on a repo other than ampproject/amphtml."
  exit 1
fi

# GitHub provides refs/pull/<PR_NUMBER>/merge, an up-to-date merge branch for
# every PR branch that can be cleanly merged to master. For more details, see:
# https://discuss.circleci.com/t/show-test-results-for-prospective-merge-of-a-github-pr/1662
MERGE_BRANCH="refs/pull/$CIRCLE_PR_NUMBER/merge"
(set -x && git pull --ff-only origin "$MERGE_BRANCH") || err=$?

if [[ "$err" -ne "0" ]]; then
  echo
  echo -e "ERROR: Detected a merge conflict between $CIRCLE_BRANCH and master."
  echo -e "Please rebase your PR branch."
  exit $err
fi

echo -e "Successfully fetched merge commit of $CIRCLE_BRANCH with master."
