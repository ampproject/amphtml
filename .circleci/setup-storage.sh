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
#
# Script used by AMP's CI builds to authenticate with their GCP storage bucket.
# TODO(rsimha, ampproject/amp-github-apps#1110): Update storage details.

set -e

if [[ -z "${GCP_TOKEN}" ]] ;
then
  echo "Could not find the GCP_TOKEN environment variable. Exiting."
  exit 1
fi

echo "Extracting credentials..."
openssl aes-256-cbc -k $GCP_TOKEN -in ./build-system/common/sa-travis-key.json.enc -out sa-travis-key.json -d

echo "Authenticating with GCP storage..."
gcloud auth activate-service-account --key-file=sa-travis-key.json

echo "Applying settings..."
gcloud config set account sa-travis@amp-travis-build-storage.iam.gserviceaccount.com
gcloud config set pass_credentials_to_gsutil true
gcloud config set project amp-travis-build-storage

echo "Successfully set up GCP storage."
