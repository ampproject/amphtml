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
