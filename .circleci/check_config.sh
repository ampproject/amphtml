#!/bin/bash
#
# This script checks if a PR branch is using the most recent CircleCI config.
# Reference: https://circleci.com/docs/2.0/env-vars/#built-in-environment-variables

set -e
err=0

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }
YELLOW() { echo -e "\033[0;33m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }

# Push builds are only run against the main, nightly, and amp-release branches.
if [[ "$CIRCLE_BRANCH" == "main" || "$CIRCLE_BRANCH" == "nightly" || "$CIRCLE_BRANCH" =~ ^amp-release-* ]]; then
  echo $(GREEN "Nothing to do because $CIRCLE_BRANCH is not a PR branch.")
  exit 0
fi

# Check if the PR branch contains the most recent revision the CircleCI config.
CONFIG_REV=`git rev-list main -1 -- .circleci/config.yml`
(set -x && git merge-base --is-ancestor $CONFIG_REV $CIRCLE_SHA1) || err=$?

if [[ "$err" -ne "0" ]]; then
  echo "$(RED "ERROR:") $(CYAN $CIRCLE_BRANCH) is missing the latest CircleCI config revision $(CYAN $CONFIG_REV)."
  echo -e "\n"

  echo $(YELLOW "This can be fixed in three ways:")
  echo -e "\n"

  echo "1. Click the $(CYAN "\"Update branch\"") button on GitHub and follow instructions."
  echo "   ⤷ It can be found towards the bottom of the PR, after the list of checks."
  echo -e "\n"

  echo "2. Pull the latest commits from $(CYAN "main") and re-push the PR branch."
  echo "   ⤷ Follow these steps:"
  echo ""
  echo "      $(CYAN "git checkout main")"
  echo "      $(CYAN "git pull")"
  echo "      $(CYAN "git checkout <PR branch>")"
  echo "      $(CYAN "git merge main")"
  echo "      $(CYAN "git push origin")"
  echo -e "\n"

  echo "3. Rebase on $(CYAN "main") and re-push the PR branch."
  echo "   ⤷ Follow these steps:"
  echo ""
  echo "      $(CYAN "git checkout main")"
  echo "      $(CYAN "git pull")"
  echo "      $(CYAN "git checkout <PR branch>")"
  echo "      $(CYAN "git rebase main")"
  echo "      $(CYAN "git push origin --force")"
  echo -e "\n"
  exit 1
fi

echo $(GREEN "$CIRCLE_BRANCH is using the latest CircleCI config.")
