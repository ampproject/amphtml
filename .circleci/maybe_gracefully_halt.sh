#!/bin/bash
#
# Script used by AMP's CI builds to gracefully halt unnecessary jobs, before
# executing time-consuming steps such as checking out the code or installing
# dependencies.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
YELLOW() { echo -e "\033[0;33m$1\033[0m"; }

if ls /tmp/restored-workspace/.CI_GRACEFULLY_HALT_* 1>/dev/null 2>&1; then
  echo $(GREEN "Gracefully halting this job.")
  circleci-agent step halt
  exit 0
fi

if [[ ${FLAVOR} && ${FLAVOR} != 'base' ]]; then
  # Extract the commit SHA. For PR jobs, this is written to .CIRCLECI_MERGE_COMMIT.
  if [[ -f /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT ]]; then
    COMMIT_SHA="$(cat /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT)"
  else
    COMMIT_SHA="${CIRCLE_SHA1}"
  fi

  # Do not proceed if the experiment config is missing a valid name, constant, or date.
  EXPERIMENT_JSON=$(curl -sS "https://raw.githubusercontent.com/ampproject/amphtml/${COMMIT_SHA}/build-system/global-configs/experiments-config.json" | jq ".${FLAVOR}")
  if ! echo "${EXPERIMENT_JSON}" | jq -e '.name,.define_experiment_constant,.expiration_date_utc'; then
    echo $(YELLOW "Flavor ${FLAVOR} is misconfigured, or does not exist.")
    echo $(GREEN "Gracefully halting this job")
    circleci-agent step halt
    exit 0
  fi

  # Do not proceed if the experiment is expired (config date is in the past).
  CURRENT_TIMESTAMP=$(date --utc +'%s')
  EXPERIMENT_EXPIRATION_TIMESTAMP=$(date --utc --date $(echo "${EXPERIMENT_JSON}" | jq -er '.expiration_date_utc') +'%s')
  if [[ $CURRENT_TIMESTAMP -gt $EXPERIMENT_EXPIRATION_TIMESTAMP ]]; then
    echo $(YELLOW "Flavor ${FLAVOR} is expired.")
    echo $(GREEN "Gracefully halting this job")
    circleci-agent step halt
    exit 0
  fi
fi
