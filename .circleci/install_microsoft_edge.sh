#!/bin/bash
#
# Script used by AMP's CI builds to install Microsoft Edge Stable on CircleCI.
# Reference: https://www.microsoftedgeinsider.com/en-us/download?platform=linux-deb

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }

echo "$(GREEN "Installing Microsoft Edge...")"
curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > microsoft.gpg
sudo install -o root -g root -m 644 microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64] https://packages.microsoft.com/repos/edge stable main" > /etc/apt/sources.list.d/microsoft-edge-dev.list'
sudo rm microsoft.gpg
sudo apt update && sudo apt install microsoft-edge-stable
EDGE_STABLE_BIN=`which microsoft-edge-stable`
echo "export EDGE_STABLE_BIN=${EDGE_STABLE_BIN}" >> $BASH_ENV
echo $(GREEN "Installation complete.")
