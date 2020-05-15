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
# This script stops the sauce connect proxy, and waits for a clean exit.

CYAN() { echo -e "\033[0;36m$1\033[0m"; }
YELLOW() { echo -e "\033[1;33m$1\033[0m"; }

PID_FILE="sauce_connect_pid"
LOG_FILE="sauce_connect_log"
LOG_PREFIX=$(YELLOW "stop_sauce_connect.sh")

# Early exit if there's no proxy running.
if [[ ! -f "$PID_FILE" ]]; then
  echo "$LOG_PREFIX Sauce Connect Proxy is not running"
  exit 0
fi

# Stop the sauce connect proxy.
PID="$(cat "$PID_FILE")"
echo "$LOG_PREFIX Stopping Sauce Connect Proxy pid $(CYAN "$PID")"
kill "$PID"

# Clean up files.
if [[ -f "$LOG_FILE" ]]; then
  echo "$LOG_PREFIX Cleaning up log file $(CYAN "$LOG_FILE")"
  rm "$LOG_FILE"
fi
if [[ -f "$PID_FILE" ]]; then
  echo "$LOG_PREFIX Cleaning up pid file $(CYAN "$PID_FILE")"
  rm "$PID_FILE"
fi

# Done.
echo "$LOG_PREFIX Successfully stopped Sauce Connect Proxy"
