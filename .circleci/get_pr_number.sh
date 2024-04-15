#!/bin/bash
#
# This script extracts the PR number (if there is one) for a CircleCI build.
# Reference: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables

set -e
err=0

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
YELLOW() { echo -e "\033[0;33m$1\033[0m"; }

# Push builds are only run against the main, nightly, and amp-release branches.
if [[ "$CIRCLE_BRANCH" == "main" || "$CIRCLE_BRANCH" == "nightly" || "$CIRCLE_BRANCH" =~ ^amp-release-* ]]; then
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
