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
# connection. Works on Linux and Mac OS.

CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }
GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }

SC_VERSION="sc-4.5.1"
AUTHENTICATED_STATUS_URL="https://$SAUCE_USERNAME:$SAUCE_ACCESS_KEY@saucelabs.com/rest/v1/info/status"
STATUS_URL="https://saucelabs.com/rest/v1/info/status"
DOWNLOAD_DIR="sauce_connect"
PID_FILE="sauce_connect_pid"
LOG_FILE="sauce_connect_log"
OUTPUT_FILE="sauce_connect_output"
READY_FILE="sauce_connect_ready"
READY_DELAY_SECS=120
LOG_PREFIX=$(YELLOW "start_sauce_connect.sh")

if [[ -z "$SAUCE_USERNAME" || -z "$SAUCE_ACCESS_KEY" ]]; then
  echo "$LOG_PREFIX The $(CYAN "SAUCE_USERNAME") and $(CYAN "SAUCE_ACCESS_KEY") environment variables must be set."
  exit 1
fi

if [[ "$OSTYPE" == "linux-gnu" ]]; then
  DOWNLOAD_URL="https://saucelabs.com/downloads/$SC_VERSION-linux.tar.gz"
  ARCHIVE_FILE="$DOWNLOAD_DIR/$SC_VERSION-linux.tar.gz"
  BINARY_FILE="$SC_VERSION-linux/bin/sc"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  DOWNLOAD_URL="https://saucelabs.com/downloads/$SC_VERSION-osx.zip"
  ARCHIVE_FILE="$DOWNLOAD_DIR/$SC_VERSION-osx.zip"
  BINARY_FILE="$SC_VERSION-osx/bin/sc"
else
  echo "$LOG_PREFIX Sauce Connect Proxy launcher script does not support the $(CYAN "$OSTYPE") platform."
  exit 1
fi

# Start a timer to track how long setup took
START_TIME=$( date +%s )
echo "$LOG_PREFIX Starting $(CYAN "start_sauce_connect.sh")..."

# Check the status of the Sauce Labs service
echo "$LOG_PREFIX Fetching current Sauce Labs service status from $(CYAN "$STATUS_URL")..."
SAUCE_STATUS="$(curl -s "$AUTHENTICATED_STATUS_URL")"
SERVICE_OPERATIONAL="$(echo "$SAUCE_STATUS" | jq '.service_operational')"
STATUS_MESSAGE="$(echo "$SAUCE_STATUS" | jq '.status_message')"
ERROR_MESSAGE="$(echo "$SAUCE_STATUS" | jq '.message')"
if [[ "$STATUS_MESSAGE" = "null" ]]; then
  echo "$LOG_PREFIX $(RED "ERROR:") Could not fetch Sauce Labs Service status. Message: $(CYAN "$ERROR_MESSAGE")"
  echo "$LOG_PREFIX Attempting to connect anyway..."
else
  if [[ $SERVICE_OPERATIONAL = "true" ]]; then
    echo "$LOG_PREFIX $(GREEN "SUCCESS:") Sauce Labs is operational. Status: $(CYAN "$STATUS_MESSAGE")"
  else
    echo "$LOG_PREFIX $(RED "ERROR:") Sauce Labs does not appear to be operational. Status: $(CYAN "$STATUS_MESSAGE")"
    echo "$LOG_PREFIX Attempting to connect anyway..."
  fi
fi

# Download the sauce connect proxy binary (if needed) and unpack it.
if [[ -f $ARCHIVE_FILE ]]; then
  echo "$LOG_PREFIX Using cached Sauce Connect binary $(CYAN "$ARCHIVE_FILE")"
else
  echo "$LOG_PREFIX Downloading $(CYAN "$DOWNLOAD_URL")"
  if [[ "$OSTYPE" == "linux-gnu" ]]; then
    wget -q "$DOWNLOAD_URL" -P "$DOWNLOAD_DIR"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    curl -s --create-dirs -o "$ARCHIVE_FILE" -O "$DOWNLOAD_URL"
  fi
fi
echo "$LOG_PREFIX Unpacking $(CYAN "$ARCHIVE_FILE")"
if [[ "$OSTYPE" == "linux-gnu" ]]; then
  tar -xzf "$ARCHIVE_FILE"
elif [[ "$OSTYPE" == "darwin"* ]]; then
  unzip -qu "$ARCHIVE_FILE"
fi

# Clean up old files, if any.
if [[ -f "$LOG_FILE" ]]; then
  echo "$LOG_PREFIX Deleting old log file $(CYAN "$LOG_FILE")"
  rm "$LOG_FILE"
fi
if [[ -f $PID_FILE ]]; then
  echo "$LOG_PREFIX Deleting old pid file $(CYAN "$PID_FILE")"
  rm "$PID_FILE"
fi
if [[ -f "$OUTPUT_FILE" ]]; then
  echo "$LOG_PREFIX Deleting old output file $(CYAN "$OUTPUT_FILE")"
  rm "$OUTPUT_FILE"
fi

# Establish the tunnel identifier (job number on Travis / username during local dev).
if [[ -z "$TRAVIS_JOB_NUMBER" ]]; then
  TUNNEL_IDENTIFIER="$(git log -1 --pretty=format:"%ae")"
else
  TUNNEL_IDENTIFIER="$TRAVIS_JOB_NUMBER"
fi


# Launch proxy and wait for a tunnel to be created.
echo "$LOG_PREFIX Launching $(CYAN "$BINARY_FILE")..."
# --no-ssl-bump-domains corresponds to "addons > hosts" in .travis.yml.
"$BINARY_FILE" --verbose --no-ssl-bump-domains "*.localhost,*.recaptcha.localhost" --tunnel-identifier "$TUNNEL_IDENTIFIER" --readyfile "$READY_FILE" --pidfile "$PID_FILE" --logfile "$LOG_FILE" 1>"$OUTPUT_FILE" 2>&1 &
count=0
while [ $count -lt $READY_DELAY_SECS ]
do
  if [ -e "$READY_FILE" ]
  then
    # Print confirmation.
    PID="$(cat "$PID_FILE")"
    if [[ "$OSTYPE" == "linux-gnu" ]]; then
      TUNNEL_ID="$(grep -oP "Tunnel ID: \K.*$" "$OUTPUT_FILE")"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
      TUNNEL_ID="$(grep -o "Tunnel ID: .*$" "$OUTPUT_FILE" | cut -d' ' -f3)"
    fi
    echo "$LOG_PREFIX Sauce Connect Proxy with tunnel ID $(CYAN "$TUNNEL_ID") and identifier $(CYAN "$TUNNEL_IDENTIFIER") is now running as pid $(CYAN "$PID")"
    END_TIME=$( date +%s )
    TOTAL_TIME=$(( END_TIME - START_TIME ))
    echo "$LOG_PREFIX Done running $(CYAN "start_sauce_connect.sh") Total time: $(CYAN "$TOTAL_TIME"s)"
    echo "$LOG_PREFIX To stop the proxy, run $(CYAN "stop_sauce_connect.sh") from the same directory"
    break
  else
    # Continue waiting.
    sleep 1
    (( count++ ))
    if [ $count -eq $READY_DELAY_SECS ]
    then
      # Print the error logs.
      echo "$LOG_PREFIX Sauce Connect Proxy has not started after $(CYAN "$READY_DELAY_SECS") seconds."
      echo "$LOG_PREFIX Console output:"
      cat "$OUTPUT_FILE"
      echo "$LOG_PREFIX Log file contents:"
      cat "$LOG_FILE"
      exit 1
    fi
  fi
done
