#!/bin/bash
#
# This script updates the .git cache and fetches the merge commit of a PR branch
# with the main branch to make sure PRs are tested against all the latest
# changes on CircleCI.

set -e
err=0

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }

# Update the .git cache for non-main branches.
if [[ "$CIRCLE_BRANCH" == "main" ]]; then
  echo "$(GREEN "No need to update the") $(CYAN ".git") $(GREEN "cache because this is the") $(CYAN "main") $(GREEN "branch.")"
else
  echo "$(GREEN "Fetching") $(CYAN "main") $(GREEN "branch to update") $(CYAN ".git") $(GREEN "cache.")"
  git fetch origin main:main
  echo "$(GREEN "Fetching other branches to update") $(CYAN ".git") $(GREEN "cache.")"
  git fetch
fi

# Try to determine the PR number.
./.circleci/get_pr_number.sh
if [[ -f "${BASH_ENV}" ]]; then
  source $BASH_ENV
fi

# If PR_NUMBER doesn't exist, there is nothing more to do.
if [[ -z "${PR_NUMBER}" ]]; then
  exit 0
fi

# If PR_NUMBER exists, but the merge commit file doesn't exist, the PR was
# created after the first stage of CI was run. There is nothing more to do.
if [[ ! -f /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT ]]; then
  exit 0
fi

# Extract the merge commit for this workflow and make it visible to other steps.
CIRCLECI_MERGE_COMMIT="$(cat /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT)"
echo "export CIRCLECI_MERGE_COMMIT=${CIRCLECI_MERGE_COMMIT}" >> $BASH_ENV

# Fetch the merge commit. This ensures that all CI stages use the same commit.
echo "$(GREEN "Fetching merge commit") $(CYAN "${CIRCLECI_MERGE_COMMIT}")"
(set -x && git pull --ff-only origin "${CIRCLECI_MERGE_COMMIT}") || err=$?

# If a clean merge is not possible, do not proceed with the build. GitHub's UI
# will show an error indicating there was a merge conflict.
if [[ "$err" -ne "0" ]]; then
  echo "$(RED "Detected a merge conflict between") $(CYAN "${CIRCLE_BRANCH}") $(RED "and the") $(CYAN "main") $(RED "branch.")"
  echo "$(RED "Please rebase your PR branch.")"
  exit $err
fi

echo "$(GREEN "Successfully fetched merge commit of") $(CYAN "${CIRCLE_BRANCH}") $(GREEN "with the main branch.")"
