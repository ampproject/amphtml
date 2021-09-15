#!/bin/bash
#
# Script used by AMP's CI builds to install project dependencies on GH Actions.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  echo $(GREEN "Updating npm prefix...")
  npm config set prefix "$HOME/.npm"

  echo $(GREEN "Updating PATH...")
  echo "export PATH=$HOME/.npm/bin:$PATH" >> $GITHUB_ENV && source $GITHUB_ENV # For now
  echo "$HOME/.npm/bin" >> $GITHUB_PATH # For later
fi

echo $(GREEN "Enabling log coloring...")
echo "FORCE_COLOR=1" >> $GITHUB_ENV

echo $(GREEN "Installing dependencies...")
npm ci

echo $(GREEN "Successfully installed all project dependencies.")
