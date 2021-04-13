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

# Script used by AMP's CI builds to gracefully halt unnecessary jobs, before
# executing time-consuming steps such as checking out the code or installing
# dependencies.

set -e

GREEN() { echo -e "\n\033[0;32m$1\033[0m"; }
YELLOW() { echo -e "\n\033[0;33m$1\033[0m"; }

if ls /tmp/restored-workspace/.CI_GRACEFULLY_HALT_* 1>/dev/null 2>&1; then
  echo $(GREEN "Gracefully halting this job.")
  circleci-agent step halt
  exit 0
fi

if [[ $CIRCLE_JOB == Experiment* ]]; then
  # Extract the experiment name from the job name in `config.yml`.
  EXP=$(echo $CIRCLE_JOB | awk '{print $2}')
  
  # Extract the commit SHA. For PR jobs, this is written to .CIRCLECI_MERGE_COMMIT.
  if [[ -f /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT ]]; then
    COMMIT_SHA="$(cat /tmp/restored-workspace/.CIRCLECI_MERGE_COMMIT)"
  else
    COMMIT_SHA="${CIRCLE_SHA1}"
  fi

  EXPERIMENT_JSON=$(curl -sS "https://raw.githubusercontent.com/ampproject/amphtml/${COMMIT_SHA}/build-system/global-configs/experiments-config.json" | jq ".experiment${EXP}")
  if ! echo "${EXPERIMENT_JSON}" | jq -e '.name,.define_experiment_constant,.expiration_date_utc'; then
    echo $(YELLOW "Experiment ${EXP} is misconfigured, or does not exist.")
    echo $(GREEN "Gracefully halting this job")
    circleci-agent step halt
    exit 0
  fi

  CURRENT_TIMESTAMP=$(date --utc +'%s')
  EXPERIMENT_EXPIRATION_TIMESTAMP=$(date --utc --date $(echo "${EXPERIMENT_JSON}" | jq -er '.expiration_date_utc') +'%s')
  if [[ $CURRENT_TIMESTAMP -gt $EXPERIMENT_EXPIRATION_TIMESTAMP ]]; then
    echo $(YELLOW "Experiment ${EXP} is expired.")
    echo $(GREEN "Gracefully halting this job")
    circleci-agent step halt
    exit 0
  fi
fi  
