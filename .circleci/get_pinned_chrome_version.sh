#!/bin/bash
#
# Script used to determine the pinned version of Google Chrome on CircleCI.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }
CYAN() { echo -e "\033[0;36m$1\033[0m"; }

# Extract the chromedriver version used by AMP's E2E tests
# See https://www.npmjs.com/package/chromedriver
echo "$(GREEN "Extracting Chromedriver version from") $(CYAN "build-system/tasks/e2e/package.json")$(GREEN "...")"
CHROMEDRIVER_VERSION="$(cat build-system/tasks/e2e/package.json | jq -r .devDependencies.chromedriver)"
if [[ -z "$CHROMEDRIVER_VERSION" ]]; then
  echo "$(RED "Could not extract Chromedriver version from") $(CYAN "build-system/tasks/e2e/package.json"))"
  exit 1
fi
echo "$(GREEN "Chromedriver version is") $(CYAN "${CHROMEDRIVER_VERSION}")"

# Determine the Chrome major version to be installed
echo "$(GREEN "Determining Chrome major version...")"
CHROME_MAJOR_VERSION="$(echo $CHROMEDRIVER_VERSION | cut -d'.' -f1)"
if [[ -z "$CHROME_MAJOR_VERSION" ]]; then
  echo "$(RED "Could not determine Chrome major version")"
  exit 1
fi
echo "$(GREEN "Chrome major version is") $(CYAN "${CHROME_MAJOR_VERSION}")"

# Determine the Chrome version history URL based on the platform identifier
# See https://developer.chrome.com/docs/versionhistory/reference/#platform-identifiers
echo "$(GREEN "Determining Chrome version history URL...")"
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  PLATFORM_IDENTIFIER="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  PLATFORM_IDENTIFIER="mac"
elif [[ "$OSTYPE" == "win32" ]]; then
  PLATFORM_IDENTIFIER="win"
else
  echo "$(RED "Incompatible OS") $(CYAN "${OSTYPE}")"
  exit 1
fi
CHROME_VERSION_HISTORY_URL="https://versionhistory.googleapis.com/v1/chrome/platforms/${PLATFORM_IDENTIFIER}/channels/stable/versions"
echo "$(GREEN "Chrome version history URL is") $(CYAN "${CHROME_VERSION_HISTORY_URL}")"

# Determine the Chrome version
# See https://developer.chrome.com/docs/versionhistory/guide
echo "$(GREEN "Determining Chrome version...")"
CHROME_VERSION="$(curl -sS --retry 3 ${CHROME_VERSION_HISTORY_URL} | jq -r ".versions[]|.version" | grep -m 1 "${CHROME_MAJOR_VERSION}\.[[:digit:]]\+.[[:digit:]]\+.[[:digit:]]\+")"
echo "$(GREEN "Chrome version is") $(CYAN "${CHROME_VERSION}")"

# Workaround for https://github.com/CircleCI-Public/browser-tools-orb/issues/70
echo "export ORB_PARAM_CHROME_VERSION=$CHROME_VERSION" >> $BASH_ENV
echo $(GREEN "Successfully determined pinned version of Chrome")
