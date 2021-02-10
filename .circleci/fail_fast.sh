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

# This script early-exits the CircleCI workflow when a single job fails.
# Reference: https://support.circleci.com/hc/en-us/articles/360052058811-Exit-build-early-if-any-test-fails

set -e

RED() { echo -e "\n\033[0;31m$1\033[0m"; }

echo $(RED "Exiting workflow because a job failed.")
curl -X POST \
--header "Content-Type: application/json" \
"https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}/cancel?circle-token=${CIRCLE_TOKEN}"
