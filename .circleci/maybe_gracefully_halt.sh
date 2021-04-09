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

CYAN() { echo -e "\033[0;36m$1\033[0m"; }

if ls /tmp/restored-workspace/.CI_GRACEFULLY_HALT_* 1>/dev/null 2>&1; then
  echo $(CYAN "Gracefully halting this job.")
  circleci-agent step halt
fi
