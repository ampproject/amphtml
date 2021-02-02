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
# Script used by AMP's CI builds to authenticate with GCP storage on CircleCI.
# TODO(rsimha, ampproject/amp-github-apps#1110): Update storage details.

set -e

GREEN() { echo -e "\033[0;32m$1\033[0m"; }
RED() { echo -e "\033[0;31m$1\033[0m"; }

if [[ -z "${GCP_TOKEN}" ]] ;
then
  echo $(RED "Could not find the GCP_TOKEN environment variable. Exiting.")
  exit 1
fi

echo $(GREEN "Installing Google Cloud SDK...")
(set -x && cd ~/ && curl -Ss --retry 5 https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-323.0.0-linux-x86_64.tar.gz | tar xz)

echo $(GREEN "Setting up Cloud SDK environment...")
(set -x && echo "source ~/google-cloud-sdk/path.bash.inc" >> $BASH_ENV)
source $BASH_ENV

echo $(GREEN "Extracting credentials...")
openssl aes-256-cbc -k $GCP_TOKEN -in ./build-system/common/sa-travis-key.json.enc -out sa-travis-key.json -d

echo $(GREEN "Authenticating with GCP storage...")
gcloud auth activate-service-account --key-file=sa-travis-key.json

echo $(GREEN "Applying settings...")
gcloud config set account sa-travis@amp-travis-build-storage.iam.gserviceaccount.com
gcloud config set pass_credentials_to_gsutil true
gcloud config set project amp-travis-build-storage

echo $(GREEN "Successfully set up GCP storage.")
