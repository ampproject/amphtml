#!/bin/bash
#
# Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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
# This script builds the Java AMP Validator.
set -e # Exit on error
bazel clean
bazel run //:fetchAMPResources
bazel build //:amphtml_validator_java_proto_lib
bazel run //:copyValidatorJavaSource
bazel build //:amphtml_validator_lib
bazel build //:amphtml_validator_test
