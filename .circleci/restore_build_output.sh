#!/bin/bash
#
# Script used by AMP's CI builds to restore any build outputs from previous jobs
# in the workflow.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
YELLOW() { echo -e "\033[0;33m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }

MERGABLE_OUTPUT_DIRS="build dist dist.3p dist.tools"
WORKSPACE_DIR="/tmp/restored-workspace"

if [[ -d "${WORKSPACE_DIR}/builds" ]]; then
  echo $(GREEN "Installing rsync...")
  sudo apt update && sudo apt install rsync

  echo $(GREEN "Restoring build output from workspace")
  for RESTORED_BUILD_DIR in ${WORKSPACE_DIR}/builds/*; do
    for OUTPUT_DIR in ${MERGABLE_OUTPUT_DIRS}; do
      RESTORED_DIR="${RESTORED_BUILD_DIR}/${OUTPUT_DIR}"
      if [[ -d "${RESTORED_DIR}" ]]; then
        echo "*" $(GREEN "Merging") $(CYAN "${RESTORED_DIR}") $(GREEN "into") $(CYAN "./${OUTPUT_DIR}")
        rsync -a "${RESTORED_DIR}/" "./${OUTPUT_DIR}"
      fi
    done
  done
else
  echo $(YELLOW "Workspace does not contain any build outputs to restore")
fi
