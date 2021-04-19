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

# This script early-exits CircleCI PR builds when one of its jobs fails.
# Reference: https://support.circleci.com/hc/en-us/articles/360052058811-Exit-build-early-if-any-test-fails
# In case of the `main` or a release branch, it emails the build/release-on-duty
# team using Twilio SendGrid: https://sendgrid.com/

set -e

RED() { echo -e "\n\033[0;31m$1\033[0m"; }
YELLOW() { echo -e "\n\033[0;33m$1\033[0m"; }

send_email() {
  curl --request POST \
    --url https://api.sendgrid.com/v3/mail/send \
    --header "Authorization: Bearer ${SENDGRID_API_KEY}" \
    --header "Content-Type: application/json" \
    --data '{
        "from": {
          "email": "bot+noreply@amp.dev"
        },
        "template_id": "d-5a6b574506534ab3aad1da13a78cdeb4",
        "personalizations": [
          {
            "to": [
              {
                "email": "'${1}'",
                "name": "'${2}'"
              }
            ],
            "dynamic_template_data": {
              "branch": "'${CIRCLE_BRANCH}'",
              "name": "'${2}'",
              "build_url": "'${CIRCLE_BUILD_URL}'"
            }
          }
        ]
      }'
}

# For push builds, continue in spite of failures so that other jobs like
# bundle-size and visual-diff can establish their baselines for this commit.
# Without this, our custom bots will not be able to function correctly.
if [[ "$CIRCLE_BRANCH" == "main" ]]; then
  echo $(YELLOW "This main branch build failed, notifying @ampproject/build-on-duty.")
  send_email "amp-build-on-duty@grotations.appspotmail.com" "AMP Build On-Duty"
  exit 0
elif [[ "$CIRCLE_BRANCH" =~ ^amp-release-* ]]; then
  echo $(YELLOW "This release branch build failed, notifying @ampproject/release-on-duty.")
  send_email "amp-release-on-duty@grotations.appspotmail.com" "AMP Release On-Duty"
  exit 0
else
  echo $(YELLOW "DO NOT MERGE")
  send_email "rodaniel@google.com" "Daniel Rozenberg"
fi

# For PR builds, cancel when the first job fails.
echo $(RED "Canceling PR build because a job failed.")
curl -X POST \
--header "Content-Type: application/json" \
"https://circleci.com/api/v2/workflow/${CIRCLE_WORKFLOW_ID}/cancel?circle-token=${CIRCLE_TOKEN}"
