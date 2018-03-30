#!/bin/bash
#
# Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
#
# This script starts the sauce connect proxy, and waits for a successful
# connection.

CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }

SC_VERSION="sc-4.4.12-linux"
DOWNLOAD_URL="https://saucelabs.com/downloads/$SC_VERSION.tar.gz"
TAR_FILE="$SC_VERSION.tar.gz"
BINARY_FILE="$SC_VERSION/bin/sc"
PID_FILE="sauce_connect_pid"
LOG_FILE="sauce_connect_log"
START_MESSAGE="Sauce Connect is up, you may start your tests."
LOG_PREFIX=$(YELLOW "start_sauce_connect.sh")

# Download and unpack sauce connect proxy binary.
echo $LOG_PREFIX "Downloading" $(CYAN $DOWNLOAD_URL)
wget -q $DOWNLOAD_URL
echo $LOG_PREFIX "Unpacking" $(CYAN $TAR_FILE)
tar -xzf $TAR_FILE

# Clean up old log files, if any.
if [ -f $LOG_FILE ]; then
  echo $LOG_PREFIX "Deleting old log file" $(CYAN $LOG_FILE)
  rm $LOG_FILE
fi
if [ -f $PID_FILE ]; then
  echo $LOG_PREFIX "Deleting old pid file" $(CYAN $PID_FILE)
  rm $PID_FILE
fi

# Establish the tunnel identifier (job number on Travis / username during local dev).
if [ -z $TRAVIS_JOB_NUMBER ]; then
  TUNNEL_IDENTIFIER=$(git log -1 --pretty=format:"%ae")
else
  TUNNEL_IDENTIFIER=$TRAVIS_JOB_NUMBER
fi

# Launch proxy and wait for completion.
echo $LOG_PREFIX "Launching" $(CYAN $BINARY_FILE)
$BINARY_FILE --tunnel-identifier $TUNNEL_IDENTIFIER --pidfile $PID_FILE 1>$LOG_FILE 2>&1 &
sleep 2
( tail -f -n0 $LOG_FILE & ) | grep -q "$START_MESSAGE"

# Print confirmation.
PID=$(cat $PID_FILE)
TUNNEL_ID=$(grep -oP "Tunnel ID: \K.*$" $LOG_FILE)
echo $LOG_PREFIX "Sauce Connect Proxy with tunnel ID" $(CYAN $TUNNEL_ID) "and identifier" $(CYAN $TUNNEL_IDENTIFIER) "is now running as pid" $(CYAN $PID)
